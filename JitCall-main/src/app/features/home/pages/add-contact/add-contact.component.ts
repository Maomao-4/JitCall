import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.scss'],
  standalone: false
})
export class AddContactComponent {
  form = this.fb.group({
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
  });

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private toast: ToastController,
    private router: Router
  ) {}

  async onSubmit() {
    const telefono = this.form.value.telefono;
    if (!telefono) return;

    const result = await this.contactService.searchUserByPhone(telefono);

    if (!result) {
      const t = await this.toast.create({ message: 'Usuario no encontrado.', duration: 2000, color: 'danger' });
      return t.present();
    }

    const currentUid = this.contactService.getCurrentUserId();
    if (result.uid === currentUid) {
      const t = await this.toast.create({ message: 'No puedes agregarte a ti mismo.', duration: 2000, color: 'warning' });
      return t.present();
    }

    await this.contactService.addContact({
      uid: result.uid,
      nombre: result.data.nombre,
      apellido: result.data.apellido,
      telefono: result.data.telefono
    });

    const t = await this.toast.create({ message: 'Contacto agregado.', duration: 2000, color: 'success' });
    await t.present();
    this.router.navigate(['/home']);
  }

}
