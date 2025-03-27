const originalUsersList = document.getElementById('originalUsersList');
const modifiedUsersList = document.getElementById('modifiedUsersList');

let originalUsers = [];
let modifiedUsers = [];
let newUsers = []; // new users added via POST

function clearForm() {
    const form = document.getElementById('userForm');
    form.reset();

    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.value = '';
    }
}

// Helper: render list
function renderUserList(container, users) {
    container.innerHTML = '';
    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.style.display = 'flex';
        listItem.style.alignItems = 'center';
        listItem.style.marginBottom = '10px';

        listItem.innerHTML = `
            <img src="${user.avatar || 'https://via.placeholder.com/50'}"
                 style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;">
            <span>ID: ${user.id || '-'} ${user.name || '-'} - ${user.email || '-'}</span>
        `;
        container.appendChild(listItem);
    });
}

// GET: Load Original Users
document.getElementById('getButton').addEventListener('click', async () => {
    try {
        const res1 = await fetch('https://reqres.in/api/users?page=1');
        const res2 = await fetch('https://reqres.in/api/users?page=2');
        const data1 = await res1.json();
        const data2 = await res2.json();
        originalUsers = [...data1.data, ...data2.data].map(u => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`,
            email: u.email,
            avatar: u.avatar
        }));
        renderUserList(originalUsersList, originalUsers);
    } catch (err) {
        alert('Failed to fetch users');
    }
    
});

// POST: Add user to modified
document.getElementById('postButton').addEventListener('click', () => {
    const formData = new FormData(document.getElementById('userForm'));

    const userId = parseInt(formData.get('userId'));
    const name = formData.get('name');
    const email = formData.get('email');
    const photoFile = document.getElementById('photoInput').files[0];

    if (!userId || !name || !email) {
        alert('Please fill in ID, name, and email for new user.');
        return;
    }

    const existsInOriginal = originalUsers.some(user => user.id === userId);
    const existsInNewUsers = newUsers.some(user => user.id === userId);

    if (existsInOriginal || existsInNewUsers) {
        alert('A user with this ID already exists.');
        return;
    }

    const newUser = {
        id: userId,
        name: name,
        email: email,
        avatar: photoFile ? URL.createObjectURL(photoFile) : 'https://via.placeholder.com/50'
    };

    newUsers.push(newUser);

    // Combine original users and new users for display
    modifiedUsers = [...originalUsers, ...newUsers];
    renderUserList(modifiedUsersList, modifiedUsers);
    clearForm();
});

// PUT: Replace user in modified
document.getElementById('putButton').addEventListener('click', () => {
    const form = new FormData(document.getElementById('userForm'));
    const userId = parseInt(form.get('userId'));
    const name = form.get('name');
    const email = form.get('email');

    if (!userId || !name || !email) {
        return alert('ID, name, and email required');
    }

    const index = modifiedUsers.findIndex(u => u.id === userId);
    if (index === -1) {
        return alert('User not found in modified list');
    }

    modifiedUsers[index] = {
        id: userId,
        name,
        email,
        avatar: modifiedUsers[index].avatar || 'https://via.placeholder.com/50'
    };
    renderUserList(modifiedUsersList, modifiedUsers);
    clearForm();
});

// PATCH: Update part of user in modified
document.getElementById('patchButton').addEventListener('click', () => {
    const formData = new FormData(document.getElementById('userForm'));
    const userId = parseInt(formData.get('userId'));
    if (!userId) return alert('Please enter a valid user ID.');

    const name = formData.get('name');
    const email = formData.get('email');

    let userIndex = modifiedUsers.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        if (name) modifiedUsers[userIndex].name = name;
        if (email) modifiedUsers[userIndex].email = email;
        renderUserList(modifiedUsersList, modifiedUsers);
        return;
    }

    const originalUser = originalUsers.find(user => user.id === userId);
    if (originalUser) {
        const patchedUser = { ...originalUser };
        if (name) patchedUser.name = name;
        if (email) patchedUser.email = email;
        modifiedUsers.push(patchedUser);
        renderUserList(modifiedUsersList, modifiedUsers);
    } else {
        alert('User ID not found in original or modified users.');
    }
    clearForm();
});
