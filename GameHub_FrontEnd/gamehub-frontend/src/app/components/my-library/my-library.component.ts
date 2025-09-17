// src/app/components/my-library/my-library.component.ts

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.service';

// --- Import các module cần thiết cho Standalone Component ---
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-library',
  standalone: true,
  imports: [
    CommonModule,  // Cần cho *ngIf, *ngFor, | async
    RouterModule   // Cần cho [routerLink]
  ],
  templateUrl: './my-library.component.html',
  styleUrls: ['./my-library.component.scss']
})
export class MyLibraryComponent implements OnInit {
  // Dùng $ để ký hiệu đây là một Observable
  libraryItems$!: Observable<any[]>;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    // Gọi hàm từ service và gán kết quả cho Observable
    this.libraryItems$ = this.userService.getUserLibrary();
  }
}