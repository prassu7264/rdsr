import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ToasterService } from 'src/app/core/services/toaster.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  @Output() toggleEmitor = new EventEmitter<void>();
  departments: any = []
  shifts: any = [];
  designation: any = [];
  previewUrl: string | ArrayBuffer | null = null;
  constructor(private fb: FormBuilder, private authService: AuthService, private storageService: StorageService, private toasterService: ToasterService) { }
  ngOnInit(): void {
    this.getAllShifts();
    this.getAllDepartments();
  }
  userForm: FormGroup = this.fb.group({
    // Identity
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    gender: ['', Validators.required],
    marital_status: [''],
    blood_group: [''],
    date_of_birth: [null, Validators.required],
    image_url: [null, Validators.required],

    // Contact
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    alternate_email: [''],
    mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10,}$')]],
    skypeid: [''],

    // Employment
    role: [null, Validators.required],
    deptid: [null, Validators.required],
    positionid: [null, Validators.required],
    shiftid: [null, Validators.required],
    managerid: [null],
    sub_manager_id: [null],
    attendanceid: ['', Validators.required],
    joining_date: [null, Validators.required],

    // Toggles
    wfh: [false],
    isactive: [true],
    username: [this.storageService.getUsername()]
  });

  // Helper getter for easy access in template
  get rf() {
    return {
      firstname: this.userForm.get('firstname'),
      lastname: this.userForm.get('lastname'),
      gender: this.userForm.get('gender'),
      marital_status: this.userForm.get('marital_status'),
      blood_group: this.userForm.get('blood_group'),
      date_of_birth: this.userForm.get('date_of_birth'),
      image_url: this.userForm.get('image_url'),
      email: this.userForm.get('email'),
      password: this.userForm.get('password'),
      alternate_email: this.userForm.get('alternate_email'),
      mobile: this.userForm.get('mobile'),
      skypeid: this.userForm.get('skypeid'),
      role: this.userForm.get('role'),
      deptid: this.userForm.get('deptid'),
      positionid: this.userForm.get('positionid'),
      shiftid: this.userForm.get('shiftid'),
      managerid: this.userForm.get('managerid'),
      sub_manager_id: this.userForm.get('sub_manager_id'),
      attendanceid: this.userForm.get('attendanceid'),
      joining_date: this.userForm.get('joining_date'),
      wfh: this.userForm.get('wfh'),
      isactive: this.userForm.get('isactive')
    };
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        this.previewUrl = reader.result
        this.userForm.patchValue({ image_url: this.previewUrl });
      };
      reader.readAsDataURL(file);
      // Mark as touched so validation style can update
      this.userForm.get('image_url')?.markAsTouched();
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log('Form Data:', this.userForm.value);
      this.authService.createUser(this.userForm.value).subscribe((res: any) => {
        this.toasterService.success(res?.message)
        this.toggleFilter();
      }, err => {
        this.toasterService.error(err?.error?.message)
      })
    } else {
      // Mark all as touched to trigger error states
      this.userForm.markAllAsTouched();
    }


  }

  onCancel() {
    this.userForm.reset();
    this.toggleFilter();
  }



  toggleFilter() {
    this.toggleEmitor.emit();
  }

  getAllShifts() {
    this.authService.getAllShifts().subscribe(res => {
      console.log(res);
      this.shifts = res
    })
  }
  getAllDepartments() {
    this.authService.getAllDepartments().subscribe(res => {
      this.departments = res;
    })
  }
  getDesignationByDepartment(e: any) {
    this.authService.getDesignationByDepartment(e).subscribe(res => {
      this.designation = res
    })
  }
}
