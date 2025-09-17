import { Component, OnInit, Inject, PLATFORM_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

// Import các module của Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';

// Import Service
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatSliderModule, 
    MatIconModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  allGames: any[] = [];
  filteredGames: any[] = [];
  featuredGames: any[] = [];
  filterForm: FormGroup;
  private swiperInstance?: Swiper;

  constructor(
    private gameService: GameService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      genre: ['All'],
      maxPrice: [100]
    });
  }

  ngOnInit(): void {
    this.loadAllGames();

    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(filters => {
      this.applyFilters(filters);
    });
  }

  private loadAllGames(): void {
    this.gameService.getGames().subscribe({
      next: (data) => {
        this.allGames = data;
        this.filteredGames = data;
        this.featuredGames = data.slice(0, 5);
        this.initSwiper();
      },
      error: (error) => {
        console.error('Error fetching games:', error);
      }
    });
  }

  private applyFilters(filters: any): void {
    let gamesToFilter = [...this.allGames];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      if (searchTerm) {
        gamesToFilter = gamesToFilter.filter(game => 
          game.title.toLowerCase().includes(searchTerm) || 
          game.developer.toLowerCase().includes(searchTerm)
        );
      }
    }

    if (filters.genre && filters.genre !== 'All') {
      gamesToFilter = gamesToFilter.filter(game => game.genres.includes(filters.genre));
    }

    if (filters.maxPrice < 100) {
      gamesToFilter = gamesToFilter.filter(game => game.price <= filters.maxPrice);
    }

    this.filteredGames = gamesToFilter;
  }

  private initSwiper(): void {
    if (isPlatformBrowser(this.platformId) && this.featuredGames.length > 1) {
      setTimeout(() => {
        this.swiperInstance = new Swiper('.hero-swiper', {
          modules: [Navigation, Pagination],
          loop: true,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
        });
      }, 0);
    }
  }
}