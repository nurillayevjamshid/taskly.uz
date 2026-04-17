const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🔍 Testing API...');

  // Test health check
  const health = await fetch(`${API_BASE}/health`).then(r => r.json());
  console.log('✅ Health check:', health);

  // Test get columns
  const columns = await fetch(`${API_BASE}/columns`).then(r => r.json());
  console.log(`✅ Columns found: ${columns.length}`);
  columns.forEach(col => {
    console.log(`   - ${col.title} (${col.tasks.length} tasks)`);
  });

  // Test get tasks
  const tasks = await fetch(`${API_BASE}/tasks`).then(r => r.json());
  console.log(`✅ Tasks found: ${tasks.length}`);
  tasks.forEach(task => {
    console.log(`   - ${task.title} (Column: ${task.columnId})`);
  });

  console.log('🎉 API is working correctly!');
}

testAPI().catch(console.error);
