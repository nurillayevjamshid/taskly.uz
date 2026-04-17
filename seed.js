const API_BASE = 'http://localhost:3001/api';

async function seed() {
  console.log('🌱 Seeding demo data...');

  // Create standard columns
  const columns = [
    { title: 'Vazifalar', color: '#3b82f6', order: 0, isStandard: true },
    { title: 'Jarayonda', color: '#f59e0b', order: 1, isStandard: true },
    { title: "Ko'rib chiqilmoqda", color: '#8b5cf6', order: 2, isStandard: true },
    { title: 'Bajarildi', color: '#10b981', order: 3, isStandard: true },
    { title: 'Bajarilmadi', color: '#ef4444', order: 4, isStandard: true }
  ];

  const createdColumns = [];
  for (const col of columns) {
    const response = await fetch(`${API_BASE}/columns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(col)
    });
    const data = await response.json();
    createdColumns.push(data);
    console.log(`✅ Created column: ${col.title}`);
  }

  // Create tasks
  const tasks = [
    {
      title: 'Loyiha rejasini tayyorlash',
      description: 'Vazifalar jadvalini yaratish va strukturani belgilash',
      columnId: createdColumns[0].id,
      order: 0
    },
    {
      title: 'Database setup qilish',
      description: 'MySQL va Prisma o\'rnatish',
      columnId: createdColumns[1].id,
      order: 0
    },
    {
      title: 'API endpoints yaratish',
      description: 'Express server va CRUD endpoints',
      columnId: createdColumns[1].id,
      order: 1
    },
    {
      title: 'Frontend integration',
      description: 'React komponentlarini API ga ulash',
      columnId: createdColumns[2].id,
      order: 0
    },
    {
      title: 'Testlash',
      description: 'Barcha funksiyalarni test qilish',
      columnId: createdColumns[3].id,
      order: 0
    },
    {
      title: 'Xatolikni tuzatish',
      description: 'Backend bilan bog\'lanishdagi muammolarni hal qilish',
      columnId: createdColumns[4].id,
      order: 0
    }
  ];

  for (const task of tasks) {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    const data = await response.json();
    console.log(`✅ Created task: ${task.title}`);

    // Add tags to first task
    if (task.title === 'Loyiha rejasini tayyorlash') {
      await fetch(`${API_BASE}/tasks/${data.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Muhim', color: '#ef4444' })
      });
      await fetch(`${API_BASE}/tasks/${data.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Boshlanish', color: '#3b82f6' })
      });
    }
  }

  console.log('🎉 Demo data yaratildi!');
}

seed().catch(console.error);
