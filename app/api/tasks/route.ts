import { NextResponse } from 'next/server';
import { getTasks, createTask } from '@/lib/db';

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, assigned_to, status, priority, due_date } = body;

    if (!title || !assigned_to || !due_date) {
      return NextResponse.json(
        { success: false, error: 'Title, assigned_to, and due_date are required' },
        { status: 400 }
      );
    }

    const newTask = await createTask({
      title,
      description: description || '',
      assigned_to,
      status: status || 'Pending',
      priority: priority || 'Medium',
      due_date,
    });

    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
