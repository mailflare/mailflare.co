import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

const MAX_SUBSCRIBERS = 10_000;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email } = data;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({
        error: 'Invalid email address'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const filePath = path.join(process.cwd(), 'newsletter-subscribers.txt');
    
    // Create file if it doesn't exist
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, '');
    }

    // Check if email already exists
    const content = await fs.readFile(filePath, 'utf-8');
    const subscribers = content.split('\n').filter(Boolean);
    
    if (subscribers.includes(email)) {
      return new Response(JSON.stringify({
        error: 'Email already subscribed'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check subscriber limit
    if (subscribers.length >= MAX_SUBSCRIBERS) {
      return new Response(JSON.stringify({
        error: 'Newsletter signup limit reached. Please try again later.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Store email in file
    await fs.appendFile(filePath, `${email}\n`);

    return new Response(JSON.stringify({
      message: 'Successfully subscribed to newsletter'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to subscribe to newsletter'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 