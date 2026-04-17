import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Taskly API is running' });
});

// Columns CRUD
app.get('/api/columns', async (req, res) => {
  try {
    const columns = await prisma.column.findMany({
      include: { tasks: { include: { tags: true, comments: true } } },
      orderBy: { order: 'asc' }
    });
    res.json(columns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
});

app.post('/api/columns', async (req, res) => {
  try {
    const { title, color, order } = req.body;
    const column = await prisma.column.create({
      data: { title, color, order }
    });
    res.json(column);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create column' });
  }
});

app.put('/api/columns/:id', async (req, res) => {
  try {
    const { title, color, order } = req.body;
    const column = await prisma.column.update({
      where: { id: req.params.id },
      data: { title, color, order }
    });
    res.json(column);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update column' });
  }
});

app.delete('/api/columns/:id', async (req, res) => {
  try {
    await prisma.column.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Column deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete column' });
  }
});

// Tasks CRUD
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { tags: true, comments: true }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { tags: true, comments: true }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, startDate, dueDate, assignee, attachments, columnId, order } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignee,
        attachments,
        columnId,
        order
      }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, description, startDate, dueDate, assignee, attachments, columnId, order } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignee,
        attachments,
        columnId,
        order
      }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Tags CRUD
app.post('/api/tasks/:taskId/tags', async (req, res) => {
  try {
    const { text, color } = req.body;
    const tag = await prisma.tag.create({
      data: {
        text,
        color,
        taskId: req.params.taskId
      }
    });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

app.delete('/api/tags/:id', async (req, res) => {
  try {
    await prisma.tag.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// Comments CRUD
app.post('/api/tasks/:taskId/comments', async (req, res) => {
  try {
    const { text, author } = req.body;
    const comment = await prisma.comment.create({
      data: {
        text,
        author,
        taskId: req.params.taskId
      }
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    await prisma.comment.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
