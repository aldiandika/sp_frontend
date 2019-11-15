import { TestBed } from '@angular/core/testing';

import { DataBankService } from './data-bank.service';

describe('DataBankService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataBankService = TestBed.get(DataBankService);
    expect(service).toBeTruthy();
  });
});
