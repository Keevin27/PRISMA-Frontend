import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  imports: [SidebarComponent, RouterOutlet],
})
export class LayoutComponent {
  constructor(private authService: AuthService, private router: Router){}
  cerrarSesion() {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
}
