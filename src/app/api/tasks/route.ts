import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');

    let whereClause: any = {};
    
    if (projectId) whereClause.projectId = projectId;
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (assignedTo) whereClause.assignedTo = assignedTo;

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            name: true,
            code: true
          }
        },
        assignee: {
          select: {
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Error fetching tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      createdById
    } = body;

    // Validaciones
    if (!projectId || !title || !status || !priority || !createdById) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const task = await db.task.create({
      data: {
        projectId,
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo: assignedTo || null,
        createdById
      },
      include: {
        project: {
          select: {
            name: true,
            code: true
          }
        },
        assignee: {
          select: {
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Error creating task' },
      { status: 500 }
    );
  }
}