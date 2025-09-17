import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CartService } from './cart.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   private apiUrl = `${environment.apiUrl}/auth`; 
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean; // Biến để lưu trạng thái môi trường

  constructor(
    private http: HttpClient,
    private router: Router,
     private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID
  ) {
    // Kiểm tra môi trường một lần duy nhất trong constructor
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    const token = this.getToken();
    if (token && !this.currentUserSubject.value) {
      const headers = new HttpHeaders().set('x-auth-token', token);
      this.http.get<any>(this.apiUrl, { headers }).subscribe({
        next: user => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // Chỉ lưu token nếu đang ở trình duyệt
        if (this.isBrowser) {
          localStorage.setItem('token', response.token);
        }
        this.loadCurrentUser();
      })
    );
  }

   logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
    
    // 3. Gọi phương thức clearCart() ở đây
    this.cartService.clearCart(); 
    
    this.router.navigate(['/']);
  }


  getToken(): string | null {
    // Chỉ lấy token nếu đang ở trình duyệt
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null; // Trả về null nếu đang ở server
  }

  isLoggedIn(): boolean {
    // Chỉ kiểm tra token nếu đang ở trình duyệt
    if (this.isBrowser) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

   updateCurrentUser(updatedUser: any) {
    this.currentUserSubject.next(updatedUser);
  }
}