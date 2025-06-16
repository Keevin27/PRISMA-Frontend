import { Component, HostBinding, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  private readonly _open = signal(false);

  toggle() {
    this._open.update(v => !v);
  }
  @HostBinding('class.open')
  get isOpen() {
    return this._open();
  }
}
