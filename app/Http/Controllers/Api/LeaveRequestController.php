<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeaveRequestRequest;
use App\Http\Requests\UpdateLeaveRequestRequest;
use App\Http\Requests\UpdateLeaveRequestStatusRequest;
use App\Http\Resources\LeaveRequestResource;
use App\Models\LeaveRequest;

class LeaveRequestController extends Controller
{
    public function index()
    {
        $leaveRequests = LeaveRequest::query()
            ->with(['employee.user', 'leaveType'])
            ->when(request('employee_name'), function ($query, string $name): void {
                $query->whereHas('employee.user', function ($userQuery) use ($name): void {
                    $userQuery->where('name', 'like', "%{$name}%");
                });
            })
            ->when(request('status'), function ($query, string $status): void {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(request('per_page', 10));

        return LeaveRequestResource::collection($leaveRequests);
    }

    public function store(StoreLeaveRequestRequest $request): LeaveRequestResource
    {
        $leaveRequest = LeaveRequest::create([
            ...$request->validated(),
            'status' => LeaveRequest::STATUS_PENDING,
        ])->load(['employee.user', 'leaveType']);

        return new LeaveRequestResource($leaveRequest);
    }

    public function show(LeaveRequest $leaveRequest): LeaveRequestResource
    {
        return new LeaveRequestResource($leaveRequest->load(['employee.user', 'leaveType']));
    }

    public function update(UpdateLeaveRequestRequest $request, LeaveRequest $leaveRequest): LeaveRequestResource
    {
        $leaveRequest->update($request->validated());

        return new LeaveRequestResource($leaveRequest->load(['employee.user', 'leaveType']));
    }

    public function destroy(LeaveRequest $leaveRequest)
    {
        $leaveRequest->delete();

        return response()->noContent();
    }

    public function updateStatus(UpdateLeaveRequestStatusRequest $request, LeaveRequest $leaveRequest): LeaveRequestResource
    {
        $leaveRequest->update($request->validated());

        return new LeaveRequestResource($leaveRequest->load(['employee.user', 'leaveType']));
    }
}
