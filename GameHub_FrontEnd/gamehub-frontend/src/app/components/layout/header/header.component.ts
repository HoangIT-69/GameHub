import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  currentUser$: Observable<any>;
  cartItemCount$: Observable<number>;
  constructor(private authService: AuthService, private cartService: CartService ) {
    this.currentUser$ = this.authService.currentUser$;
    this.cartItemCount$ = this.cartService.cartItems$.pipe(
      map((items: any[]) => items.length) 
    );
  }

  logout(): void {
    this.authService.logout();
  }
}