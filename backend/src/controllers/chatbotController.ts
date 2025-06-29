import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';

export class ChatbotController {
  async handleQuery(req: AuthenticatedRequest, res: Response) {
    try {
      const { query: userQuery, sessionId } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!userQuery) {
        return res.status(400).json({
          success: false,
          message: 'Query is required'
        });
      }

      console.log(`Chatbot query from ${user.email} (${user.role}): ${userQuery}`);

      // Log the chatbot usage
      // TODO: enable activity logging when stable
      // await query(
      //   'INSERT INTO user_activity_logs (user_id, activity_type, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      //   [user.userId, 'chatbot_usage', `Chatbot query: ${userQuery}`, req.ip, req.get('User-Agent') || null]
      // );

      // Process the query based on user role
      let response = await this.processQueryByRole(userQuery, user, sessionId);

      // Get role-specific quick replies
      const quickReplies = this.getRoleSpecificQuickReplies(user.role);

      return res.json({
        success: true,
        response: response,
        quick_replies: quickReplies,
        user_role: user.role,
        session_id: sessionId
      });

    } catch (error: any) {
      console.error('Chatbot query error:', error);
      return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error processing your query',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }

  private async processQueryByRole(userQuery: string, user: any, sessionId: string): Promise<string> {
    const query_lower = userQuery.toLowerCase();

    // Role-based query processing
    switch (user.role) {
      case 'admin':
        return await this.processAdminQuery(query_lower, user, sessionId);
      case 'teacher':
        return await this.processTeacherQuery(query_lower, user, sessionId);
      case 'student':
        return await this.processStudentQuery(query_lower, user, sessionId);
      default:
        return "I'm sorry, but your role doesn't have access to the chatbot functionality.";
    }
  }

  private async processAdminQuery(queryText: string, user: any, sessionId: string): Promise<string> {
    try {
      // Allow raw SELECT queries for admins
      if (/^select\s+/i.test(queryText)) {
        // Sanitize query: remove trailing semicolon if present
        const sanitizedQuery = queryText.trim().replace(/;$/, '');
        const result = await query(sanitizedQuery);
        if (!result.rows || result.rows.length === 0) {
          return 'No results returned.';
        }
        // Show up to 10 rows
        const rows = result.rows.slice(0, 10).map(row => JSON.stringify(row)).join('\n');
        return `Query results (up to 10 rows):\n${rows}`;
      }

      // Admin has access to all data
      if (queryText.includes('users') || queryText.includes('all users')) {
        const result = await query('SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 10');
        const users = result.rows.map(row => 
          `${row.first_name} ${row.last_name} (${row.email}) - ${row.role}`
        ).join('\n');
        return `Recent users:\n${users}`;
      }

      if (queryText.includes('statistics') || queryText.includes('stats')) {
        const userCount = await query('SELECT COUNT(*) FROM users');
        const courseCount = await query('SELECT COUNT(*) FROM courses');
        const activeUsers = await query('SELECT COUNT(*) FROM users WHERE is_active = true');
        
        return `System Statistics:
Users: ${userCount.rows[0].count}
Active Users: ${activeUsers.rows[0].count}
Courses: ${courseCount.rows[0].count}`;
      }

      if (queryText.includes('courses') || queryText.includes('all courses')) {
        const result = await query('SELECT id, title, description, created_at FROM courses ORDER BY created_at DESC LIMIT 10');
        const courses = result.rows.map(row => 
          `${row.title} - ${row.description}`
        ).join('\n');
        return `Recent courses:\n${courses}`;
      }

      return "As an admin, you can ask about: users, statistics, courses, system analytics, or database schema. Try asking 'show all users' or 'show statistics'.";
    } catch (error) {
      console.error('Admin query error:', error);
      return "Sorry, I encountered an error processing your query.";
    }
  }

  private async processTeacherQuery(queryText: string, user: any, sessionId: string): Promise<string> {
    try {
      // Teachers can access their own courses and students
      if (queryText.includes('my courses') || queryText.includes('courses')) {
        const result = await query(
          'SELECT c.id, c.title, c.description FROM courses c WHERE c.instructor_id = $1 ORDER BY c.created_at DESC',
          [user.userId]
        );
        
        if (result.rows.length === 0) {
          return "You don't have any courses assigned yet.";
        }
        
        const courses = result.rows.map(row => 
          `${row.title} - ${row.description}`
        ).join('\n');
        return `Your courses:\n${courses}`;
      }

      if (queryText.includes('students') || queryText.includes('my students')) {
        const result = await query(`
          SELECT DISTINCT u.first_name, u.last_name, u.email 
          FROM users u 
          JOIN enrollments e ON u.id = e.student_id 
          JOIN courses c ON e.course_id = c.id 
          WHERE c.instructor_id = $1 AND u.role = 'student'
          ORDER BY u.first_name
        `, [user.userId]);
        
        if (result.rows.length === 0) {
          return "No students found in your courses.";
        }
        
        const students = result.rows.map(row => 
          `${row.first_name} ${row.last_name} (${row.email})`
        ).join('\n');
        return `Students in your courses:\n${students}`;
      }

      return "As a teacher, you can ask about: 'my courses', 'my students', 'course enrollment stats', or 'assignment submissions'.";
    } catch (error) {
      console.error('Teacher query error:', error);
      return "Sorry, I encountered an error processing your query.";
    }
  }

  private async processStudentQuery(queryText: string, user: any, sessionId: string): Promise<string> {
    try {
      // Students can only access their own data
      if (queryText.includes('my courses') || queryText.includes('courses')) {
        const result = await query(`
          SELECT c.title, c.description, u.first_name as instructor_name
          FROM courses c 
          JOIN enrollments e ON c.id = e.course_id 
          LEFT JOIN users u ON c.instructor_id = u.id
          WHERE e.student_id = $1 
          ORDER BY c.title
        `, [user.userId]);
        
        if (result.rows.length === 0) {
          return "You are not enrolled in any courses yet.";
        }
        
        const courses = result.rows.map(row => 
          `${row.title} - ${row.description} (Instructor: ${row.instructor_name || 'TBA'})`
        ).join('\n');
        return `Your enrolled courses:\n${courses}`;
      }

      if (queryText.includes('assignments') || queryText.includes('my assignments')) {
        const result = await query(`
          SELECT a.title, a.description, a.due_date, c.title as course_title
          FROM assignments a 
          JOIN courses c ON a.course_id = c.id 
          JOIN enrollments e ON c.id = e.course_id 
          WHERE e.student_id = $1 
          ORDER BY a.due_date ASC
        `, [user.userId]);
        
        if (result.rows.length === 0) {
          return "No assignments found for your courses.";
        }
        
        const assignments = result.rows.map(row => 
          `${row.title} (${row.course_title}) - Due: ${row.due_date ? new Date(row.due_date).toLocaleDateString() : 'No due date'}`
        ).join('\n');
        return `Your assignments:\n${assignments}`;
      }

      return "As a student, you can ask about: 'my courses', 'my assignments', 'my grades', or 'course schedule'.";
    } catch (error) {
      console.error('Student query error:', error);
      return "Sorry, I encountered an error processing your query.";
    }
  }

  private getRoleSpecificQuickReplies(role: string): Array<{text: string}> {
    const roleReplies = {
      admin: [
        { text: "Show all users" },
        { text: "Show user statistics" },
        { text: "List all courses" },
        { text: "Show system analytics" }
      ],
      teacher: [
        { text: "Show my courses" },
        { text: "Show my students" },
        { text: "Course enrollment stats" },
        { text: "Assignment submissions" }
      ],
      student: [
        { text: "Show my courses" },
        { text: "My assignments" },
        { text: "My grades" },
        { text: "Course schedule" }
      ]
    };

    return roleReplies[role as keyof typeof roleReplies] || [{ text: "Help" }];
  }
}

export const chatbotController = new ChatbotController();
