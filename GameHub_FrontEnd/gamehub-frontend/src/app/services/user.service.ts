import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs'; 
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
   private apiUrl = `${environment.apiUrl}/users`; 

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Gọi API để mua toàn bộ giỏ hàng trong một lần.
   */
  purchaseGames(gameIds: string[], totalPrice: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
    
    const headers = new HttpHeaders().set('x-auth-token', token);
    
    const payload = {
      gameIds: gameIds,
      totalPrice: totalPrice
    };

    return this.http.post<any>(`${this.apiUrl}/purchase`, payload, { headers });
  }

  /**
   * Lấy danh sách game trong thư viện của người dùng đã đăng nhập.
   * API backend sẽ populate thông tin chi tiết của từng game.
   */
  getUserLibrary(): Observable<any[]> {
    const token = this.authService.getToken();
    if (!token) {
      // Lỗi xảy ra ở đây vì `of` chưa được import. Giờ đã sửa.
      // `of([])` tạo ra một Observable ngay lập tức phát ra một giá trị (mảng rỗng) rồi kết thúc.
      return of([]); 
    }
    
    const headers = new HttpHeaders().set('x-auth-token', token);
    
    // Gọi đến API GET /api/users/library
    return this.http.get<any[]>(`${this.apiUrl}/library`, { headers });
  }
}