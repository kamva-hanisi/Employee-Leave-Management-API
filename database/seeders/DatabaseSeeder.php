<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $annual = LeaveType::create(['name' => 'Annual Leave']);
        $sick = LeaveType::create(['name' => 'Sick Leave']);
        LeaveType::create(['name' => 'Family Responsibility Leave']);

        $user = User::factory()->create([
            'name' => 'Demo Employee',
            'email' => 'demo@example.com',
            'password' => 'password',
        ]);

        $employee = Employee::create([
            'user_id' => $user->id,
            'department' => 'Engineering',
            'phone' => '+27110000000',
        ]);

        LeaveRequest::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $annual->id,
            'start_date' => now()->addWeeks(2)->toDateString(),
            'end_date' => now()->addWeeks(2)->addDays(4)->toDateString(),
            'reason' => 'Planned vacation.',
            'status' => LeaveRequest::STATUS_PENDING,
        ]);

        LeaveRequest::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $sick->id,
            'start_date' => now()->addWeek()->toDateString(),
            'end_date' => now()->addWeek()->toDateString(),
            'reason' => 'Medical appointment.',
            'status' => LeaveRequest::STATUS_APPROVED,
        ]);
    }
}
