import { TestBed } from '@angular/core/testing';
import { HttpParams, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get issues a GET to apiUrl + endpoint', () => {
    service.get('/doctors').subscribe((res) => {
      expect(res).toEqual([]);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/doctors`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('get forwards HttpParams', () => {
    const params = new HttpParams().set('page', '2');
    service.get('/doctors', params).subscribe();
    const req = httpMock.expectOne(
      `${environment.apiUrl}/doctors?page=2`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    req.flush([]);
  });

  it('post issues a POST with the body', () => {
    service.post('/x', { a: 1 }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/x`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ a: 1 });
    req.flush({});
  });

  it('put issues a PUT with the body', () => {
    service.put('/x/1', { a: 2 }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/x/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ a: 2 });
    req.flush({});
  });

  it('patch issues a PATCH with the body', () => {
    service.patch('/x/1', { a: 3 }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/x/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ a: 3 });
    req.flush({});
  });

  it('delete issues a DELETE', () => {
    service.delete('/x/1').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/x/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
