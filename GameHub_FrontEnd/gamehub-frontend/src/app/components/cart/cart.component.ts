import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  totalPrice$: Observable<number>;

  constructor(private cartService: CartService) {
    // Lấy danh sách item từ service
    this.cartItems$ = this.cartService.cartItems$;

    // Tính tổng tiền từ danh sách item
    this.totalPrice$ = this.cartItems$.pipe(
      map(items => items.reduce((total, item) => total + item.price, 0))
    );
  }

  ngOnInit(): void {}

  // Phương thức xóa một item khỏi giỏ hàng
  removeFromCart(itemId: string): void {
    this.cartService.removeFromCart(itemId);
  }

  // Phương thức xóa toàn bộ giỏ hàng
  clearCart(): void {
    if (confirm('Are you sure you want to clear the cart?')) {
      this.cartService.clearCart();
    }
  }
}