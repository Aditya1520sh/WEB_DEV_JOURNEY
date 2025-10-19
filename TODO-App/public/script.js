// script.js - Frontend logic using modern ES6+ with interactive UI
// Hinglish comments explain kar rahe hain ki DOM manipulation aur API calls kya karte hain

const apiBase = '/todos';

const elements = {
  todosContainer: document.getElementById('todos'),
  form: document.getElementById('todo-form'),
  title: document.getElementById('title'),
  description: document.getElementById('description'),
  message: document.getElementById('message'),
  cancelEdit: document.getElementById('cancel-edit'),
  submitText: document.getElementById('submit-text'),
  totalCount: document.getElementById('total-count'),
  completedCount: document.getElementById('completed-count'),
  pendingCount: document.getElementById('pending-count'),
  clearCompleted: document.getElementById('clear-completed'),
};

let editingId = null; // agar user edit mode me hai to yahan ID store hogi
let allTodos = []; // sab todos ko yahan store karenge

// Helper: show temporary message with animation
// type: 'success' | 'error' | 'info'
function showMessage(text, type = 'info') {
  elements.message.textContent = text;
  elements.message.className = 'message slide-in ' + type;
  if (text) {
    setTimeout(() => { 
      elements.message.textContent = ''; 
      elements.message.className = 'message';
    }, 4000);
  }
}

// Update statistics in header
// Ye function header me total, completed aur pending todos count dikhata hai
function updateStats() {
  const total = allTodos.length;
  const completed = allTodos.filter(t => t.completed).length;
  const pending = total - completed;
  
  elements.totalCount.textContent = `${total} Total`;
  elements.completedCount.textContent = `${completed} Done`;
  elements.pendingCount.textContent = `${pending} Pending`;
  
  // Show clear completed button agar koi completed todo hai
  elements.clearCompleted.style.display = completed > 0 ? 'block' : 'none';
}

// API: fetch all todos
// Ye function backend se saare todos fetch karta hai
async function fetchTodos() {
  try {
    const res = await fetch(apiBase);
    const data = await res.json();
    allTodos = data;
    renderTodos(data);
    updateStats();
  } catch (err) {
    console.error(err);
    showMessage('Failed to load todos', 'error');
  }
}

// Render todos list in DOM with enhanced UI
// Ye function todos ko attractive cards me display karta hai
function renderTodos(todos) {
  elements.todosContainer.innerHTML = '';
  
  if (todos.length === 0) {
    elements.todosContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <p>No todos yet. Start by adding one above!</p>
      </div>
    `;
    return;
  }

  todos.forEach((t) => {
    const card = document.createElement('div');
    card.className = 'todo-card fade-in' + (t.completed ? ' completed' : '');

    // Header with custom checkbox
    const header = document.createElement('div');
    header.className = 'todo-header';

    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkbox-wrapper';
    
    const checkbox = document.createElement('div');
    checkbox.className = 'custom-checkbox' + (t.completed ? ' checked' : '');
    checkbox.innerHTML = t.completed ? '<span class="checkmark">✓</span>' : '';
    checkbox.addEventListener('click', () => toggleComplete(t));
    checkboxWrapper.appendChild(checkbox);

    const content = document.createElement('div');
    content.className = 'todo-content';

    const title = document.createElement('h3');
    title.className = 'todo-title';
    title.textContent = t.title;

    const desc = document.createElement('p');
    desc.className = 'todo-desc';
    desc.textContent = t.description || 'No description added';

    content.append(title, desc);
    header.append(checkboxWrapper, content);

    // Footer with date and actions
    const footer = document.createElement('div');
    footer.className = 'todo-footer';

    const date = document.createElement('div');
    date.className = 'todo-date';
    date.innerHTML = `📅 ${new Date(t.created_at).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })}`;

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn edit';
    editBtn.title = 'Edit todo';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', () => startEdit(t));

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn delete';
    delBtn.title = 'Delete todo';
    delBtn.innerHTML = '🗑️';
    delBtn.addEventListener('click', () => deleteTodo(t.id));

    actions.append(editBtn, delBtn);
    footer.append(date, actions);

    card.append(header, footer);
    elements.todosContainer.appendChild(card);
  });
}

// Add or update todo on form submit
// Ye function form submit hone pe todo create/update karta hai
elements.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = elements.title.value.trim();
  const description = elements.description.value.trim();

  if (!title) {
    showMessage('⚠️ Please enter a todo title', 'error');
    elements.title.focus();
    return;
  }

  if (editingId) {
    // Update existing todo
    try {
      const res = await fetch(`${apiBase}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, completed: false })
      });
      if (!res.ok) throw new Error('Update failed');
      await res.json();
      showMessage('✅ Todo updated successfully!', 'success');
      stopEdit();
      fetchTodos();
    } catch (err) {
      console.error(err);
      showMessage('❌ Failed to update todo', 'error');
    }
  } else {
    // Create new todo
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      if (!res.ok) throw new Error('Create failed');
      await res.json();
      showMessage('✅ Todo added successfully!', 'success');
      elements.form.reset();
      fetchTodos();
    } catch (err) {
      console.error(err);
      showMessage('❌ Failed to create todo', 'error');
    }
  }
});

// Start editing a todo: populate form and set editingId
// Ye function user ko edit mode me le jata hai
function startEdit(todo) {
  editingId = todo.id;
  elements.title.value = todo.title;
  elements.description.value = todo.description || '';
  elements.cancelEdit.style.display = 'inline-flex';
  elements.submitText.textContent = 'Update Todo';
  elements.title.focus();
  
  // Smooth scroll to form
  elements.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Stop editing and reset form
function stopEdit() {
  editingId = null;
  elements.form.reset();
  elements.cancelEdit.style.display = 'none';
  elements.submitText.textContent = 'Add Todo';
}

elements.cancelEdit.addEventListener('click', () => stopEdit());

// Toggle completed state with animation
// Ye function todo ko complete/incomplete mark karta hai
async function toggleComplete(todo) {
  try {
    const res = await fetch(`${apiBase}/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: todo.title, 
        description: todo.description, 
        completed: !todo.completed 
      })
    });
    if (!res.ok) throw new Error('Toggle failed');
    showMessage(
      todo.completed ? '🔄 Marked as incomplete' : '✅ Marked as completed!', 
      'success'
    );
    fetchTodos();
  } catch (err) {
    console.error(err);
    showMessage('❌ Failed to toggle status', 'error');
  }
}

// Delete todo with confirmation
// Ye function todo ko delete karne se pehle confirmation leta hai
async function deleteTodo(id) {
  if (!confirm('Are you sure you want to delete this todo?')) return;
  
  try {
    const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    showMessage('✅ Todo deleted successfully', 'success');
    fetchTodos();
  } catch (err) {
    console.error(err);
    showMessage('❌ Failed to delete todo', 'error');
  }
}

// Clear all completed todos
// Ye function sare completed todos ko ek saath delete karta hai
elements.clearCompleted.addEventListener('click', async () => {
  const completedTodos = allTodos.filter(t => t.completed);
  if (completedTodos.length === 0) return;
  
  if (!confirm(`Delete ${completedTodos.length} completed todo(s)?`)) return;
  
  try {
    await Promise.all(
      completedTodos.map(t => fetch(`${apiBase}/${t.id}`, { method: 'DELETE' }))
    );
    showMessage('✅ Completed todos cleared!', 'success');
    fetchTodos();
  } catch (err) {
    console.error(err);
    showMessage('❌ Failed to clear completed todos', 'error');
  }
});

// Keyboard shortcuts for better UX
// Escape key se edit mode cancel karte hain
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && editingId) {
    stopEdit();
  }
});

// Initial load - page load hone pe todos fetch karte hain
fetchTodos();

