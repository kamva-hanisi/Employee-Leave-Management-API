<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeaveTypeRequest;
use App\Http\Requests\UpdateLeaveTypeRequest;
use App\Http\Resources\LeaveTypeResource;
use App\Models\LeaveType;

class LeaveTypeController extends Controller
{
    public function index()
    {
        return LeaveTypeResource::collection(
            LeaveType::query()->orderBy('name')->paginate(request('per_page', 10))
        );
    }

    public function store(StoreLeaveTypeRequest $request): LeaveTypeResource
    {
        $leaveType = LeaveType::create($request->validated());

        return new LeaveTypeResource($leaveType);
    }

    public function show(LeaveType $leaveType): LeaveTypeResource
    {
        return new LeaveTypeResource($leaveType);
    }

    public function update(UpdateLeaveTypeRequest $request, LeaveType $leaveType): LeaveTypeResource
    {
        $leaveType->update($request->validated());

        return new LeaveTypeResource($leaveType);
    }

    public function destroy(LeaveType $leaveType)
    {
        $leaveType->delete();

        return response()->noContent();
    }
}
