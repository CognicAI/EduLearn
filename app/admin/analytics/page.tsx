// @ts-nocheck
'use client';

// Temporary fix for recharts React type compatibility issues
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/lib/auth/auth-guard';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  SimpleResponsiveContainer,
  SimpleAreaChart,
  SimpleBarChart,
  SimpleLineChart,
  SimplePieChart,
  SimpleArea,
  SimpleBar,
  SimpleLine,
  SimplePie,
  SimpleCell,
  SimpleXAxis,
  SimpleYAxis,
  SimpleCartesianGrid,
  SimpleTooltip
} from '@/components/charts/simple-charts';
import { 
  Users, 
  BookOpenIcon, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Download, 
  Filter,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Target
} from 'lucide-react';

// Mock analytics data
const userGrowthData = [
  { month: 'Jul', students: 850, teachers: 45, admins: 8, total: 903 },
  { month: 'Aug', students: 920, teachers: 52, admins: 10, total: 982 },
  { month: 'Sep', students: 1050, teachers: 58, admins: 12, total: 1120 },
  { month: 'Oct', students: 1180, teachers: 65, admins: 14, total: 1259 },
  { month: 'Nov', students: 1320, teachers: 72, admins: 15, total: 1407 },
  { month: 'Dec', students: 1450, teachers: 78, admins: 16, total: 1544 }
];

const courseEngagementData = [
  { category: 'Computer Science', enrolled: 450, completed: 320, avgRating: 4.8 },
  { category: 'Web Development', enrolled: 380, completed: 290, avgRating: 4.7 },
  { category: 'Data Science', enrolled: 320, completed: 210, avgRating: 4.6 },
  { category: 'Mobile Development', enrolled: 280, completed: 180, avgRating: 4.5 },
  { category: 'Digital Marketing', enrolled: 250, completed: 200, avgRating: 4.4 },
  { category: 'Design', enrolled: 220, completed: 160, avgRating: 4.3 }
];

// Chart configurations
const userGrowthConfig: ChartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--chart-1))",
  },
  teachers: {
    label: "Teachers", 
    color: "hsl(var(--chart-2))",
  },
  admins: {
    label: "Admins",
    color: "hsl(var(--chart-3))",
  },
};

const courseEngagementConfig: ChartConfig = {
  enrolled: {
    label: "Enrolled",
    color: "hsl(var(--chart-1))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-2))",
  },
};

const platformUsageData = [
  { name: 'Desktop', value: 65, color: '#8884d8' },
  { name: 'Mobile', value: 25, color: '#82ca9d' },
  { name: 'Tablet', value: 10, color: '#ffc658' }
];

const dailyActivityData = [
  { day: 'Mon', logins: 1240, submissions: 340, discussions: 180 },
  { day: 'Tue', logins: 1180, submissions: 380, discussions: 220 },
  { day: 'Wed', logins: 1320, submissions: 420, discussions: 250 },
  { day: 'Thu', logins: 1280, submissions: 390, discussions: 210 },
  { day: 'Fri', logins: 1150, submissions: 310, discussions: 190 },
  { day: 'Sat', logins: 890, submissions: 180, discussions: 120 },
  { day: 'Sun', logins: 750, submissions: 140, discussions: 90 }
];

const performanceMetrics = [
  { 
    metric: 'Course Completion Rate', 
    current: 78, 
    target: 80, 
    trend: 'up',
    change: '+3%'
  },
  { 
    metric: 'Student Satisfaction', 
    current: 92, 
    target: 90, 
    trend: 'up',
    change: '+2%'
  },
  { 
    metric: 'Teacher Engagement', 
    current: 85, 
    target: 85, 
    trend: 'stable',
    change: '0%'
  },
  { 
    metric: 'Platform Uptime', 
    current: 99.8, 
    target: 99.5, 
    trend: 'up',
    change: '+0.3%'
  }
];

const recentActivity = [
  { 
    id: '1', 
    type: 'user_registration', 
    description: '15 new students registered', 
    time: '2 hours ago',
    trend: 'up'
  },
  { 
    id: '2', 
    type: 'course_completion', 
    description: '23 courses completed today', 
    time: '4 hours ago',
    trend: 'up'
  },
  { 
    id: '3', 
    type: 'system_alert', 
    description: 'Server load spike detected', 
    time: '6 hours ago',
    trend: 'down'
  },
  { 
    id: '4', 
    type: 'feature_usage', 
    description: 'Analytics dashboard views +25%', 
    time: '8 hours ago',
    trend: 'up'
  }
];

export default function AdminAnalyticsPage() {
  const { user } = useAuth();

  const totalUsers = userGrowthData[userGrowthData.length - 1].total;
  const totalCourses = courseEngagementData.reduce((sum, cat) => sum + cat.enrolled, 0);
  const avgCompletionRate = Math.round(
    courseEngagementData.reduce((sum, cat) => sum + (cat.completed / cat.enrolled), 0) / courseEngagementData.length * 100
  );
  const avgRating = (
    courseEngagementData.reduce((sum, cat) => sum + cat.avgRating, 0) / courseEngagementData.length
  ).toFixed(1);

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Advanced Analytics
                </h1>
                <p className="text-muted-foreground mt-2">
                  Comprehensive platform insights and performance metrics
                </p>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="30days">
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Course Enrollments</CardTitle>
                  <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCourses.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgCompletionRate}%</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgRating}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +0.2 from last month
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* User Growth Trends */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth Trends</CardTitle>
                    <CardDescription>
                      Monthly user registration and growth patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleResponsiveContainer width="100%" height={300}>
                      <SimpleAreaChart data={userGrowthData}>
                        <SimpleCartesianGrid strokeDasharray="3 3" />
                        <SimpleXAxis dataKey="month" />
                        <SimpleYAxis />
                        <SimpleTooltip />
                        <SimpleArea 
                          type="monotone" 
                          dataKey="students" 
                          stackId="1"
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          name="Students"
                        />
                        <SimpleArea 
                          type="monotone" 
                          dataKey="teachers" 
                          stackId="1"
                          stroke="#82ca9d" 
                          fill="#82ca9d" 
                          name="Teachers"
                        />
                        <SimpleArea 
                          type="monotone" 
                          dataKey="admins" 
                          stackId="1"
                          stroke="#ffc658" 
                          fill="#ffc658" 
                          name="Admins"
                        />
                      </SimpleAreaChart>
                    </SimpleResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Usage</CardTitle>
                  <CardDescription>
                    Device distribution of active users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleResponsiveContainer width="100%" height={300}>
                    <SimplePieChart>
                      <SimplePie
                        data={platformUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformUsageData.map((entry, index) => (
                          <SimpleCell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </SimplePie>
                      <SimpleTooltip />
                    </SimplePieChart>
                  </SimpleResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Desktop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Mobile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Tablet</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Course Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Engagement by Category</CardTitle>
                  <CardDescription>
                    Enrollment and completion rates across course categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleResponsiveContainer width="100%" height={300}>
                    <SimpleBarChart data={courseEngagementData}>
                      <SimpleCartesianGrid strokeDasharray="3 3" />
                      <SimpleXAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                      <SimpleYAxis />
                      <SimpleTooltip />
                      <SimpleBar dataKey="enrolled" fill="#8884d8" name="Enrolled" />
                      <SimpleBar dataKey="completed" fill="#82ca9d" name="Completed" />
                    </SimpleBarChart>
                  </SimpleResponsiveContainer>
                </CardContent>
              </Card>

              {/* Daily Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Activity Patterns</CardTitle>
                  <CardDescription>
                    User engagement throughout the week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleResponsiveContainer width="100%" height={300}>
                    <SimpleLineChart data={dailyActivityData}>
                      <SimpleCartesianGrid strokeDasharray="3 3" />
                      <SimpleXAxis dataKey="day" />
                      <SimpleYAxis />
                      <SimpleTooltip />
                      <SimpleLine 
                        type="monotone" 
                        dataKey="logins" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Logins"
                      />
                      <SimpleLine 
                        type="monotone" 
                        dataKey="submissions" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name="Submissions"
                      />
                      <SimpleLine 
                        type="monotone" 
                        dataKey="discussions" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        name="Discussions"
                      />
                    </SimpleLineChart>
                  </SimpleResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Metrics */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>
                      Key performance indicators and targets
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {performanceMetrics.map((metric, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{metric.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {metric.current}% / {metric.target}%
                            </span>
                            <Badge variant="outline" className={
                              metric.trend === 'up' ? 'text-green-600' : 
                              metric.trend === 'down' ? 'text-red-600' : 
                              'text-gray-600'
                            }>
                              {metric.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                               metric.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : 
                               <Clock className="h-3 w-3 mr-1" />}
                              {metric.change}
                            </Badge>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={metric.current} className="h-3" />
                          <div 
                            className="absolute top-0 h-3 w-0.5 bg-red-500 opacity-50"
                            style={{ left: `${metric.target}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Current: {metric.current}%</span>
                          <span>Target: {metric.target}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Activity</CardTitle>
                  <CardDescription>
                    Latest platform activities and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.trend === 'up' ? 'bg-green-500' : 
                        activity.trend === 'down' ? 'bg-red-500' : 
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                          {activity.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {activity.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}