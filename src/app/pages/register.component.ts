import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="wrap">
      <section class="hero">
        <div class="brand">
          <img class="logo-img" src="logo.png" alt="SMS Logo" />
          <small>Secured Manpower Services</small>
        </div>

        <div class="pitch">
          <h2>Supply Monitoring System</h2>
          <p>Keep every uniform and pair of shoes accounted for.</p>
          <ul>
            <li><span>📦</span> Track stock by item, size and color</li>
            <li><span>🚚</span> Record what each employee receives</li>
            <li><span>⚠️</span> Get alerts before supplies run out</li>
          </ul>
        </div>

        <small class="foot">© Secured Manpower Services</small>
      </section>

      <section class="side">
        <div class="mobile-brand">
          <img class="logo-img" src="logo.png" alt="SMS Logo" />
          <strong>SMS Supply</strong>
        </div>

        <div class="card">
          <h1>Create account</h1>
          <p class="sub">Get started managing your inventory.</p>

          <form (ngSubmit)="submit()">
            <label>
              <span>Email</span>
              <input type="email" name="email" [(ngModel)]="email" required
                     autocomplete="email" placeholder="name@company.com">
            </label>

            <label>
              <span>Password</span>
              <input type="password" name="password" [(ngModel)]="password" required
                     autocomplete="new-password" placeholder="At least 6 characters">
            </label>

            <label>
              <span>Confirm password</span>
              <input type="password" name="confirm" [(ngModel)]="confirm" required
                     autocomplete="new-password" placeholder="Re-enter password">
            </label>

            @if (error) { <div class="err">{{ error }}</div> }

            @if (success) { <div class="ok">{{ success }}</div> }

            <button type="submit" class="go" [disabled]="busy">Register</button>
          </form>

          <p class="alt">Already have an account? <a routerLink="/login">Log in</a></p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .wrap { position: fixed; inset: 0; z-index: 50; display: grid; grid-template-columns: 1.1fr 1fr; background: #f4f8ff; overflow: auto; }

    .hero { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
            padding: 44px 52px; color: #fff; background: linear-gradient(160deg, #0b2a6f 0%, #1d4ed8 60%, #38bdf8 100%);
            view-transition-name: brand-panel; }
    .hero::before, .hero::after { content: ''; position: absolute; border-radius: 50%; background: rgba(255,255,255,.08); }
    .hero::before { width: 380px; height: 380px; right: -120px; top: -120px; }
    .hero::after  { width: 260px; height: 260px; left: -90px; bottom: -80px; }
    .hero > * { position: relative; z-index: 1; }

    /* identical brand block on login + register */
    .brand { display: flex; align-items: center; gap: 14px; height: 68px; }
    .logo-img { width: 68px; height: 68px; flex-shrink: 0; box-sizing: border-box; object-fit: contain;
                background: #fff; border-radius: 50%; padding: 5px; box-shadow: 0 4px 12px rgba(0,0,0,.2); }
    .brand small { font-size: 13.6px; line-height: 1.2; color: rgba(255,255,255,.75); display: block; }

    .pitch h2 { font-size: 34px; line-height: 1.15; margin: 0 0 12px; }
    .pitch p { font-size: 16px; opacity: .9; margin: 0 0 28px; max-width: 380px; }
    .pitch ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; }
    .pitch li { display: flex; align-items: center; gap: 12px; font-size: 15px; }
    .pitch li span { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,.16); }
    .foot { opacity: .7; }

    .side { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; }
    .mobile-brand { display: none; align-items: center; gap: 12px; font-size: 20px; margin-bottom: 20px; color: #0b2a6f; }
    .mobile-brand .logo-img { width: 72px; height: 72px; border: 2px solid #e3ebfa; box-shadow: 0 4px 12px rgba(29,78,216,.18); }

    .card { width: 100%; max-width: 400px; background: #fff; border-radius: 20px; padding: 36px 32px;
            border: 1px solid #e3ebfa; box-shadow: 0 18px 50px rgba(29, 78, 216, .12);
            view-transition-name: auth-card; }
    .card h1 { margin: 0; font-size: 26px; color: #0b1b4d; }
    .sub { margin: 6px 0 24px; color: #64748b; }

    form { display: grid; gap: 16px; }
    label span { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #334155; }
    input { width: 100%; box-sizing: border-box; height: 44px; padding: 0 14px; border-radius: 12px;
            border: 1px solid #d5e0f5; background: #f8fbff; font-size: 15px; outline: none; transition: border-color .15s, box-shadow .15s; }
    input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, .15); background: #fff; }

    .err { padding: 10px 12px; border-radius: 10px; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; font-size: 14px; }
    .ok { padding: 10px 12px; border-radius: 10px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 14px; text-align: center; font-weight: 500; }

    .go { height: 46px; border: 0; border-radius: 999px; cursor: pointer; font-size: 16px; font-weight: 600; color: #fff;
          background: linear-gradient(90deg, #1d4ed8, #2563eb 60%, #38bdf8); transition: transform .1s, opacity .15s; }
    .go:hover:not(:disabled) { transform: translateY(-1px); }
    .go:disabled { opacity: .6; cursor: wait; }

    .alt { text-align: center; margin: 20px 0 0; color: #64748b; font-size: 14px; }
    .alt a { color: #2563eb; font-weight: 600; text-decoration: none; }
    .alt a:hover { text-decoration: underline; }

    @media (max-width: 860px) {
      .wrap { grid-template-columns: 1fr; }
      .hero { display: none; }
      .mobile-brand { display: flex; }
    }
  `],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = ''; confirm = ''; error = ''; success = ''; busy = false;

  async submit() {
    this.error = '';
    this.success = '';
    if (this.password.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
    if (this.password !== this.confirm) { this.error = 'Passwords do not match.'; return; }

    this.busy = true;
    try {
      await this.auth.register(this.email, this.password);
      this.success = 'Account created successfully!';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    } catch (e: any) {
      this.error = e.code === 'auth/email-already-in-use'
        ? 'That email is already registered. Try logging in.'
        : 'Could not create the account: ' + (e.code ?? e.message);
      this.busy = false;
    }
  }
}