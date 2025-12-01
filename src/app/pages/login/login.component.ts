import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // State Management
  currentView: 'login' | 'register' | 'forgot' = 'login';
  isDarkMode = false;
  showPassword = false;
  showRegPassword = false;

  // Reactive Forms
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  forgotForm!: FormGroup;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private layoutService: LayoutService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForms();
  }

  // Initialize all forms
  initForms() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Switch between Login, Register, Forgot
  switchView(view: 'login' | 'register' | 'forgot') {
    this.currentView = view;
  }

  toggleDarkMode(): void {
    this.layoutService.toggleTheme();
    this.isDarkMode = !this.isDarkMode;
  }

  // Toggle Login Password Visibility
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Toggle Registration Password Visibility
  toggleRegPassword() {
    this.showRegPassword = !this.showRegPassword;
  }

  // Submit handler
  onSubmit(action: string) {
    if (action === 'Login' && this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    if (action === 'Registration' && this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    if (action === 'Reset' && this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    console.log(this.loginForm);


    alert(`${action} Successful!`);
    this.router.navigate(['/main/dashboard']);
  }

  get lf() {
    return {
      email: this.loginForm.get('email'),
      password: this.loginForm.get('password')
    };
  }

  get rf() {
    return {
      fullName: this.registerForm.get('fullName'),
      email: this.registerForm.get('email'),
      password: this.registerForm.get('password')
    };
  }

  get ff() {
    return {
      email: this.forgotForm.get('email')
    };
  }
}
