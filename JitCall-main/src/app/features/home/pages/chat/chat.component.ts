import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: false,
})
export class ChatPage {
  messages = [
    { from: 'other', text: '¡Hola!' },
    { from: 'me', text: '¡Hola! ¿Cómo estás?' },
    { from: 'other', text: 'Bien, ¿y tú?' }
  ];

  newMessage = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        from: 'me',
        text: this.newMessage
      });
      this.newMessage = '';
    }
  }
}



