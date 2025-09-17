import { Component, OnInit, Inject, PLATFORM_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // 1. Import Router
import { GameService } from '../../services/game.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, RouterModule],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.scss'
})
export class GameDetailComponent implements OnInit {
  game: any = null;
  isLoading = true;
  errorMessage = '';
  private gallerySwiper?: Swiper;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private authService: AuthService, 
    private cartService: CartService, 
    private router: Router, // 2. Sửa từ RouterModule thành Router
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const gameId = this.route.snapshot.paramMap.get('id');

    if (gameId) {
      this.gameService.getGameById(gameId).subscribe({
        next: (data) => {
          this.game = data;
          this.isLoading = false;
          setTimeout(() => {
            this.initGallerySwiper();
          }, 0);
        },
        error: (err) => {
          this.errorMessage = 'Could not load game details. Please try again later.';
          this.isLoading = false;
          console.error(err);
        }
      });
    } else {
      this.errorMessage = 'Game ID is missing.';
      this.isLoading = false;
    }
  }

  // Bỏ đi AfterViewInit vì không cần thiết nữa
  // ngAfterViewInit(): void {}

  private initGallerySwiper(): void {
    if (isPlatformBrowser(this.platformId) && this.game?.images?.length > 2) {
      this.gallerySwiper = new Swiper('.gallery-swiper', {
        modules: [Navigation, Pagination],
        slidesPerView: 'auto',
        spaceBetween: 15,
        pagination: { 
          el: '.gallery-pagination', 
          clickable: true 
        },
        navigation: {
          nextEl: '.gallery-button-next',
          prevEl: '.gallery-button-prev',
        },
      });
    }
  }
    
  addToCart(game: any): void {
    if (this.authService.isLoggedIn()) {
      this.cartService.addToCart(game);
    } else {
      alert('Please log in to add items to your cart.');
      this.router.navigate(['/login']); // 3. Dòng này bây giờ sẽ hoạt động
    }
  }
}