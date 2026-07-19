import { NextResponse } from 'next/server';
import { updateTask, deleteTask } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updateTask(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!body.status && !body.assigned_to) {
      return NextResponse.json({ success: false, error: 'Field to update is required' }, { status: 400 });
    }

    const updated = await updateTask(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const deleted = await deleteTask(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
