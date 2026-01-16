import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-neutral-charcoal pb-32 pt-10">
      <div class="max-w-[800px] mx-auto px-6 animate-fade-in">
        <h1 class="text-3xl font-bold mb-8 border-b border-neutral-200 pb-4 uppercase tracking-tighter">{{ title() }}</h1>
        
        <div class="prose max-w-none text-sm leading-relaxed space-y-6 text-neutral-600">
            <p *ngFor="let p of paragraphs()">{{ p }}</p>
        </div>

        <div class="mt-16 pt-8 border-t border-neutral-100">
            <a routerLink="/" class="text-primary hover:underline text-sm font-bold uppercase tracking-widest">← Back to Shopping</a>
        </div>
      </div>
    </div>
  `
})
export class InformationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  title = signal('');
  paragraphs = signal<string[]>([]);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.loadContent(slug);
    });
  }

  loadContent(slug: string) {
    const data: any = {
      'about': {
        title: 'About Chommie',
        content: [
          'Chommie is South Africa\'s most innovative local marketplace, connecting millions of shoppers with local sellers and artisans.',
          'Founded in 2026, our mission is to redefine the shopping experience through trust, flexibility, and community-driven commerce.',
          'We believe in empowering local businesses while providing customers with an enterprise-grade shopping platform that understands the local context.'
        ]
      },
      'careers': {
        title: 'Careers at Chommie',
        content: [
          'Join the team building the future of e-commerce in Africa.',
          'We are looking for passionate engineers, designers, and logistics experts to help us scale.',
          'Check back soon for active listings in our Johannesburg and Cape Town offices.'
        ]
      },
      'privacy': {
        title: 'Privacy Notice',
        content: [
          'At Chommie, we take your privacy seriously. This notice explains how we collect, use, and protect your personal information.',
          'We use industry-standard encryption and security protocols to ensure your data stays safe.',
          'Your trust is our most valuable asset.'
        ]
      },
      'terms': {
        title: 'Conditions of Use',
        content: [
          'By using Chommie, you agree to our terms and conditions.',
          'We provide a platform for buyers and sellers to interact safely.',
          'Please ensure you read our delivery and return policies carefully before making a purchase.'
        ]
      },
      'sustainability': {
        title: 'Sustainability',
        content: [
          'We are committed to reducing our carbon footprint through optimized delivery routes and eco-friendly packaging.',
          'Our Chommie Logistics network prioritizes local hubs to minimize long-haul transport.',
          'We support sellers who use sustainable materials and ethical production methods.'
        ]
      },
      'press': {
        title: 'Press Center',
        content: [
          'Latest news and updates from the Chommie ecosystem.',
          'For media inquiries, please contact press@chommie.za',
          'Download our brand kit and official assets here.'
        ]
      }
    };

    const info = data[slug] || data['about'];
    this.title.set(info.title);
    this.paragraphs.set(info.content);
    window.scrollTo(0, 0);
  }
}
