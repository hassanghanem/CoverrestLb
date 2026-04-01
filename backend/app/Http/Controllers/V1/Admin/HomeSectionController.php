<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\HomeSectionRequest;
use App\Http\Resources\V1\Admin\HomeSectionResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\HomeSection;
use App\Models\HomeBanner;
use App\Models\HomeProductSectionItem;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HomeSectionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:title,created_at,type,arrangement,is_active',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $query = HomeSection::with(['banners', 'productSectionItems.product']);

            if (!empty($validated['search'])) {
                $search = $validated['search'];
                $locales = config('app.locales', ['en']);

                $query->where(function ($q) use ($search, $locales) {
                    $q->where('type', 'like', "%$search%");
                    foreach ($locales as $locale) {
                        $q->orWhere("title->$locale", 'like', "%$search%");
                    }
                });
            }

            $query->orderBy(
                $validated['sort'] ?? 'created_at',
                $validated['order'] ?? 'desc'
            );

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $homeSections = $query->paginate($perPage);

            return response()->json([
                'result' => true,
                'message' => __('Home sections retrieved successfully.'),
                'home_sections' => HomeSectionResource::collection($homeSections),
                'pagination' => new PaginationResource($homeSections),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve home sections.'), $e);
        }
    }

    public function show(HomeSection $homeSection)
    {
        $homeSection->load(['banners', 'productSectionItems.product']);

        return response()->json([
            'result' => true,
            'message' => __('Home section found successfully.'),
            'home_section' => new HomeSectionResource($homeSection),
        ]);
    }

    public function store(HomeSectionRequest $request)
    {
        DB::beginTransaction();
        try {
            $homeSection = HomeSection::create([
                'type' => $request->input('type'),
                'title' => $request->input('title'),
                'arrangement' => HomeSection::max('arrangement') + 1,
                'is_active' => $request->boolean('is_active', true),
            ]);

            if ($request->has('banners')) {
                foreach ($request->input('banners') as $index => $bannerData) {
                    $banner = new HomeBanner();
                    $banner->home_section_id = $homeSection->id;
                    $banner->link = $bannerData['link'] ?? null;
                    $banner->title = $bannerData['title'] ?? null;
                    $banner->subtitle = $bannerData['subtitle'] ?? null;
                    $banner->arrangement = $bannerData['arrangement'] ?? (HomeBanner::max('arrangement') + 1);
                    $banner->is_active = $bannerData['is_active'] ?? true;

                    if ($request->hasFile("banners.$index.image")) {
                        $banner->image = HomeBanner::storeImage($request->file("banners.$index.image"));
                    }
                    if ($request->hasFile("banners.$index.image_mobile")) {
                        $banner->image_mobile = HomeBanner::storeImage($request->file("banners.$index.image_mobile"));
                    }
                    $banner->save();
                }
            }

            if ($request->has('product_section_items')) {
                foreach ($request->input('product_section_items') as $itemData) {
                    HomeProductSectionItem::create([
                        'home_section_id' => $homeSection->id,
                        'product_id' => $itemData['product_id'],
                        'arrangement' => $itemData['arrangement'] ?? (HomeProductSectionItem::max('arrangement') + 1),
                        'is_active' => $itemData['is_active'] ?? true,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Home section created successfully.'),
                'home_section' => new HomeSectionResource($homeSection->load(['banners', 'productSectionItems.product'])),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create home section.'), $e);
        }
    }
    public function update(HomeSectionRequest $request, HomeSection $homeSection)
    {
        DB::beginTransaction();
        try {
            $homeSection->update([
                'type' => $request->input('type', $homeSection->type),
                'title' => $request->input('title', $homeSection->title),
                'arrangement' => HomeSection::updateArrangement($homeSection, $request->input('arrangement', $homeSection->arrangement)),
                'is_active' => $request->boolean('is_active', $homeSection->is_active),
            ]);

            if ($request->has('banners')) {
                foreach ($request->input('banners') as $index => $bannerData) {
                    if (isset($bannerData['id'])) {
                        $banner = HomeBanner::find($bannerData['id']);
                        if ($banner && $banner->home_section_id == $homeSection->id) {
                            $banner->link = $bannerData['link'] ?? $banner->link;
                            $banner->title = $bannerData['title'] ?? $banner->title;
                            $banner->subtitle = $bannerData['subtitle'] ?? $banner->subtitle;
                            $banner->arrangement = $bannerData['arrangement'] ?? $banner->arrangement;
                            $banner->is_active = $bannerData['is_active'] ?? $banner->is_active;

                            if ($request->hasFile("banners.$index.image")) {
                                HomeBanner::deleteImage($banner->getRawOriginal('image'));
                                $imageFile = $request->file("banners.$index.image");
                                $banner->image = HomeBanner::storeImage($imageFile);
                            }
                            if ($request->hasFile("banners.$index.image_mobile")) {
                                HomeBanner::deleteImage($banner->getRawOriginal('image_mobile'));
                                $image480wFile = $request->file("banners.$index.image_mobile");
                                $banner->image_mobile = HomeBanner::storeImage($image480wFile);
                            }
                            $banner->save();
                        }
                    } else {
                        $banner = new HomeBanner();
                        $banner->home_section_id = $homeSection->id;
                        $banner->link = $bannerData['link'] ?? null;
                        $banner->title = $bannerData['title'] ?? null;
                        $banner->subtitle = $bannerData['subtitle'] ?? null;
                        $banner->arrangement = $bannerData['arrangement'] ?? (HomeBanner::max('arrangement') + 1);

                        if ($request->hasFile("banners.$index.image")) {
                            $imageFile = $request->file("banners.$index.image");
                            $banner->image = HomeBanner::storeImage($imageFile);
                        }
                        if ($request->hasFile("banners.$index.image_mobile")) {
                            $image480wFile = $request->file("banners.$index.image_mobile");
                            $banner->image_mobile = HomeBanner::storeImage($image480wFile);
                        }
                        $banner->save();
                    }
                }
            }

            if ($request->has('product_section_items')) {
                $items = $request->input('product_section_items');
                $retainedIds = [];

                foreach ($items as $itemData) {
                    if (isset($itemData['id'])) {
                        $item = HomeProductSectionItem::where('home_section_id', $homeSection->id)
                            ->where('id', $itemData['id'])
                            ->first();

                        if ($item) {
                            $item->product_id = $itemData['product_id'] ?? $item->product_id;
                            $item->arrangement = $itemData['arrangement'] ?? $item->arrangement;
                            $item->is_active = $itemData['is_active'] ?? $item->is_active;
                            $item->save();
                            $retainedIds[] = $item->id;
                        }
                    } else {
                        $newItem = HomeProductSectionItem::create([
                            'home_section_id' => $homeSection->id,
                            'product_id' => $itemData['product_id'],
                            'arrangement' => $itemData['arrangement'] ?? (HomeProductSectionItem::max('arrangement') + 1),
                            'is_active' => $itemData['is_active'] ?? true,
                        ]);
                        $retainedIds[] = $newItem->id;
                    }
                }

                HomeProductSectionItem::where('home_section_id', $homeSection->id)
                    ->when(!empty($retainedIds), function ($query) use ($retainedIds) {
                        $query->whereNotIn('id', $retainedIds);
                    })
                    ->delete();
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Home section updated successfully.'),
                'home_section' => new HomeSectionResource($homeSection->load(['banners', 'productSectionItems.product'])),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update home section.'), $e);
        }
    }

    public function destroy(HomeSection $homeSection)
    {
        DB::beginTransaction();
        try {
            foreach ($homeSection->banners as $banner) {
                HomeBanner::deleteImage($banner->getRawOriginal('image'));
                HomeBanner::deleteImage($banner->getRawOriginal('image_mobile'));
            }

            HomeSection::rearrangeAfterDelete($homeSection->arrangement);
            $homeSection->delete();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Home section deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete home section.'), $e);
        }
    }
}
