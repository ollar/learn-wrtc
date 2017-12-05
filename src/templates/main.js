export default function template(data) {
    return `
        <ul id="usersList" class="users-list"></ul>
        <ul id="messagesList" class="messages-list"></ul>
        <form id="sendForm" class="send-form">
          <div class="input">
            <input id="data" autocomplete="off" autofocus="true" placeholder ="type your message here" spellcheck="true" type="text" disabled />
          </div>
          <div class="button">
            <button id="send" disabled>Send</button>
          </div>
        </form>
    `;
}
