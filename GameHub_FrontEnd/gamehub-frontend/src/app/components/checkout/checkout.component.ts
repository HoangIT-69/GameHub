// src/app/components/checkout/checkout.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, catchError, first } from 'rxjs/operators';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

// --- CÁC IMPORT CẦN THIẾT CHO TEMPLATE ---
import { CommonModule } from '@angular/common'; // Cần cho *ngIf, *ngFor, | async, | currency
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Cần cho [formGroup]
import { MatCheckboxModule } from '@angular/material/checkbox'; // Cần cho <mat-checkbox>


@Component({
  selector: 'app-checkout',
  // ==========================================================
  // === SỬA LẠI HOÀN TOÀN DECORATOR NÀY ===
  // ==========================================================
  standalone: true, // THÊM DÒNG NÀY: Đánh dấu đây là Standalone Component
  imports: [
    CommonModule,        // <-- Khai báo sử dụng CommonModule
    ReactiveFormsModule, // <-- Khai báo sử dụng ReactiveFormsModule
    MatCheckboxModule    // <-- Khai báo sử dụng MatCheckboxModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cartItems$!: Observable<CartItem[]>;
  totalPrice$!: Observable<number>;
  currentUser$!: Observable<any | null>;
  hasSufficientFunds$!: Observable<boolean>;
  isProcessing = false;

  constructor(
    private fb: FormBuilder, // Đã import FormBuilder từ '@angular/forms' ở trên
    private cartService: CartService,
    public authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartItems$ = this.cartService.cartItems$;
    this.totalPrice$ = this.cartService.totalPrice$;
    this.currentUser$ = this.authService.currentUser$;

    this.hasSufficientFunds$ = combineLatest([this.currentUser$, this.totalPrice$]).pipe(
      map(([user, totalPrice]) => user ? user.walletBalance >= totalPrice : false),
      startWith(false)
    );

    this.checkoutForm = this.fb.group({
      confirmPurchase: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid || this.isProcessing) return;
    
    this.isProcessing = true;

    combineLatest([this.cartItems$, this.totalPrice$]).pipe(
      first(),
      switchMap(([items, price]) => {
        if (items.length === 0) throw new Error('Your cart is empty.');
        const gameIds = items.map(item => item._id);
        return this.userService.purchaseGames(gameIds, price);
      }),
      catchError(error => {
        const errorMessage = error?.error?.msg || 'An unknown error occurred. Please try again.';
        alert(errorMessage);
        this.isProcessing = false;
        return of(null);
      })
    ).subscribe(updatedUser => {
      if (updatedUser) {
        this.authService.updateCurrentUser(updatedUser);
        this.cartService.clearCart();
        alert('Purchase successful! The games have been added to your library.');
        this.router.navigate(['/my-library']);
      }
    });
  }
}