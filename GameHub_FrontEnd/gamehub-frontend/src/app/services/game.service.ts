import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:5000/api/games'; // URL của backend

  constructor(private http: HttpClient) { }

  // Định nghĩa một phương thức để lấy tất cả game
getGames(filters: any = {}): Observable<any[]> {
    let params = new HttpParams();

    // Duyệt qua object filters và thêm các tham số hợp lệ vào HttpParams
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.append(key, value);
      }
    });

    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getGameById(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<any>(url);
  }

  
}