import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page" style="max-width:380px;margin-top:10vh">
      <div class="panel">
        <h1>Create account</h1>
        <form (ngSubmit)="submit()" style="display:grid;gap:.75rem">
          <label>Email <input type="email" name="email" [(ngModel)]="email" required></label>
          <label>Password (at least 6 characters) <input type="password" name="password" [(ngModel)]="password" required></label>
          <label>Confirm password <input type="password" name="confirm" [(ngModel)]="confirm" required></label>
          @if (error) { <div class="msg err">{{ error }}</div> }
          <button type="submit" [disabled]="busy">Register</button>
        </form>
        <p class="muted">Already have an account? <a routerLink="/login">Log in</a></p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = ''; confirm = ''; error = ''; busy = false;

  async submit() {
    this.error = '';
    if (this.password.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
    if (this.password !== this.confirm) { this.error = 'Passwords do not match.'; return; }
    this.busy = true;
    try {
      await this.auth.register(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error = e.code === 'auth/email-already-in-use'
        ? 'That email is already registered. Try logging in.'
        : 'Could not create the account: ' + (e.code ?? e.message);
    }
    this.busy = false;
  }
}