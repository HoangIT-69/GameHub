import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 
import { environment } from '../../environments/environment';

export interface CartItem {
  _id: string;
  title: string;
  price: number;
  images: string[];
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSource = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSource.asObservable();
  private isBrowser: boolean;
  public totalPrice$: Observable<number>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        this.cartItemsSource.next(JSON.parse(storedCart));
      }
    }
    
    // Logic tính tổng tiền
    this.totalPrice$ = this.cartItems$.pipe(
      // <-- CẢI TIẾN: Tính cả số lượng (quantity) để logic được chính xác
      map(items => items.reduce((total, item) => total + (item.price * item.quantity), 0))
    );
  }
  
  addToCart(game: any): void {
    const currentItems = this.cartItemsSource.getValue();
    const existingItem = currentItems.find(item => item._id === game._id);

    if (existingItem) {
      alert(`${game.title} is already in your cart.`);
      return;
    }
    
    const newItem: CartItem = {
      _id: game._id,
      title: game.title,
      price: game.price,
      images: game.images,
      quantity: 1 // Mặc định số lượng là 1 khi thêm mới
    };

    const updatedCart = [...currentItems, newItem];
    this.cartItemsSource.next(updatedCart);
    this.saveCartToLocalStorage(updatedCart);
    alert(`${game.title} has been added to your cart!`);
  }

  removeFromCart(itemId: string): void {
    const currentItems = this.cartItemsSource.getValue();
    const updatedCart = currentItems.filter(item => item._id !== itemId);
    this.cartItemsSource.next(updatedCart);
    this.saveCartToLocalStorage(updatedCart);
  }

  clearCart(): void {
    this.cartItemsSource.next([]);
    this.saveCartToLocalStorage([]);
  }

  private saveCartToLocalStorage(cart: CartItem[]): void {
    if (this.isBrowser) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }
}