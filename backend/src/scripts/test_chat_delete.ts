import axios from 'axios';
import dotenv from 'dotenv';
import { query } from '../config/db';

dotenv.config();

async function testChatDeletion() {
    const sessionId = `test_delete_${Date.now()}`;

    console.log('Testing Chat Deletion...');

    try {
        const userRes = await query('SELECT id FROM users LIMIT 1');
        if (userRes.rows.length === 0) {
            console.error('No users found in DB.');
            return;
        }
        const userId = userRes.rows[0].id;

        // 1. Insert test session
        await query(`
      INSERT INTO chat_sessions(session_token, user_id, metadata)
      VALUES ($1, $2, $3)
    `, [sessionId, userId, JSON.stringify({ test: true })]);
        console.log('Inserted test session.');

        // 2. Verify it exists and is not deleted
        const check1 = await query('SELECT is_deleted FROM chat_sessions WHERE session_token = $1', [sessionId]);
        if (check1.rows[0].is_deleted) {
            console.error('FAILURE: Session should not be deleted yet.');
            return;
        }

        // 3. Perform Soft Delete (Simulating the endpoint logic)
        const result = await query(`
      UPDATE chat_sessions 
      SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP
      WHERE session_token = $1 AND user_id = $2
      RETURNING id
    `, [sessionId, userId]);

        if (result.rowCount === 1) {
            console.log('SUCCESS: Soft delete query executed successfully.');
        } else {
            console.error('FAILURE: Soft delete query failed.');
        }

        // 4. Verify it is marked as deleted
        const check2 = await query('SELECT is_deleted FROM chat_sessions WHERE session_token = $1', [sessionId]);
        if (check2.rows[0].is_deleted) {
            console.log('SUCCESS: Session is marked as deleted in DB.');
        } else {
            console.error('FAILURE: Session is NOT marked as deleted.');
        }

        // Clean up (Hard delete)
        await query('DELETE FROM chat_sessions WHERE session_token = $1', [sessionId]);
        console.log('Cleaned up.');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testChatDeletion();
