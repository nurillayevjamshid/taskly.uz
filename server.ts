import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token kerak' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Noto\'g\'ri token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Taskly API is running' });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email va password kerak' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Ro\'yxatdan o\'tishda xatolik' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email va password kerak' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email yoki password noto\'g\'ri' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email yoki password noto\'g\'ri' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login qilishda xatolik' });
  }
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
