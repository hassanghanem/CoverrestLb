<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\ConfigurationRequest;
use App\Http\Resources\V1\Admin\ConfigurationResource;
use App\Models\Configuration;
use App\Services\CostCalculatorService;
use Exception;
use Illuminate\Support\Facades\DB;

class ConfigurationController extends Controller
{
    public function index()
    {
        try {
            $configs = Configuration::all();
            $costMethods = CostCalculatorService::getAvailableMethods();
            $currentCostMethod = Configuration::getValue('cost_method', CostCalculatorService::FIFO);

            return response()->json([
                'result' => true,
                'message' => __('Configuration fetched successfully.'),
                'configurations' => ConfigurationResource::collection($configs),
                'cost_methods' => [
                    'available' => $costMethods,
                    'current' => $currentCostMethod,
                ],
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to fetch configuration.'), $e);
        }
    }

    public function update(ConfigurationRequest $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();

            foreach ($data as $key => $value) {
                $config = Configuration::where('key', $key)->first();
                if ($config) {
                    $config->update(['value' => $value]);
                } else {
                    Configuration::create(['key' => $key, 'value' => $value]);
                }
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Configuration updated successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update configuration.'), $e);
        }
    }
}
