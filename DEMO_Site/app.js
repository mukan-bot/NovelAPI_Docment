document.addEventListener('DOMContentLoaded', function () {
    const content = document.getElementById('content');

    // APIのベースURLを設定
    const API_BASE_URL = 'https://novelapi.xyz:8080';

    const routes = {
        'home': showHome,
        'register': showRegister,
        'login': showLogin,
        'create-novel': showCreateNovel,
        'add-chapter': showAddChapter
    };

    document.getElementById('home-link').addEventListener('click', () => navigate('home'));
    document.getElementById('register-link').addEventListener('click', () => navigate('register'));
    document.getElementById('login-link').addEventListener('click', () => navigate('login'));
    document.getElementById('create-novel-link').addEventListener('click', () => navigate('create-novel'));
    document.getElementById('add-chapter-link').addEventListener('click', () => navigate('add-chapter'));

    function navigate(route) {
        history.pushState(null, null, `#${route}`);
        routes[route]();
    }

    function showHome() {
        content.innerHTML = '<h1>ホーム</h1><p>ようこそ、小説投稿サイトへ。</p>';
    }

    function showRegister() {
        content.innerHTML = `
            <h1>ユーザー登録</h1>
            <form id="register-form">
                <input id="register-name" placeholder="ユーザー名" required />
                <input id="register-password" type="password" placeholder="パスワード" required />
                <input id="register-email" type="email" placeholder="メールアドレス" />
                <button type="submit">登録</button>
            </form>
            <p id="register-message"></p>
        `;

        document.getElementById('register-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('register-name').value;
            const password = document.getElementById('register-password').value;
            const email = document.getElementById('register-email').value;
            const response = await fetch(`${API_BASE_URL}/CreateUser/${name}/${password}/${email}`);
            const result = await response.json();
            document.getElementById('register-message').innerText = result.message;
        });
    }

    function showLogin() {
        content.innerHTML = `
            <h1>ログイン</h1>
            <form id="login-form">
                <input id="login-name" placeholder="ユーザー名" required />
                <input id="login-password" type="password" placeholder="パスワード" required />
                <button type="submit">ログイン</button>
            </form>
            <p id="login-message"></p>
        `;

        document.getElementById('login-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('login-name').value;
            const password = document.getElementById('login-password').value;
            const response = await fetch(`${API_BASE_URL}/Login/${name}/${password}`);
            const result = await response.json();
            document.getElementById('login-message').innerText = result.message;
            if (result.message === 'Login success') {
                localStorage.setItem('user', JSON.stringify({ name, password }));
            }
        });
    }

    function showCreateNovel() {
        content.innerHTML = `
            <h1>小説作成</h1>
            <form id="create-novel-form">
                <input id="novel-title" placeholder="タイトル" required />
                <input id="novel-genre" placeholder="ジャンル" required />
                <textarea id="novel-summary" placeholder="あらすじ" required></textarea>
                <button type="submit">作成</button>
            </form>
            <p id="novel-message"></p>
        `;

        document.getElementById('create-novel-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                document.getElementById('novel-message').innerText = 'ログインしてください';
                return;
            }
            const title = document.getElementById('novel-title').value;
            const genre = document.getElementById('novel-genre').value;
            const summary = document.getElementById('novel-summary').value;
            const response = await fetch(`${API_BASE_URL}/CreateNovel/${user.name}/${user.password}/${title}/${genre}/${summary}`);
            const result = await response.json();
            document.getElementById('novel-message').innerText = result.message;
        });
    }

    async function showAddChapter() {
        content.innerHTML = `
            <h1>チャプター追加</h1>
            <form id="add-chapter-form">
                <select id="novel-select" required></select>
                <input id="chapter-title" placeholder="チャプタータイトル" required />
                <textarea id="chapter-text" placeholder="本文" required></textarea>
                <button type="submit">追加</button>
            </form>
            <p id="chapter-message"></p>
        `;

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            document.getElementById('chapter-message').innerText = 'ログインしてください';
            return;
        }

        // ユーザーの小説リストを取得
        const novelSelect = document.getElementById('novel-select');
        const response = await fetch(`${API_BASE_URL}/GetUserNovelData/${user.name}`);
        const novels = await response.json();

        // プルダウンメニューに小説を追加
        novels.forEach(novel => {
            const option = document.createElement('option');
            option.value = novel[0];
            option.text = novel[1];
            novelSelect.add(option);
        });

        document.getElementById('add-chapter-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const novel_id = novelSelect.value;
            const chapter_title = document.getElementById('chapter-title').value;
            const text = document.getElementById('chapter-text').value;
            const response = await fetch(`${API_BASE_URL}/AddText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: user.name,
                    password: user.password,
                    novel_id: parseInt(novel_id),
                    title: chapter_title,
                    text: text
                })
            });
            const result = await response.json();
            document.getElementById('chapter-message').innerText = result.message;
        });
    }

    window.addEventListener('popstate', () => {
        const route = location.hash.slice(1);
        routes[route]();
    });

    const initialRoute = location.hash.slice(1) || 'home';
    navigate(initialRoute);
});
