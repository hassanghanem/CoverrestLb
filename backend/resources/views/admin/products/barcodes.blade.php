<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Barcode Labels</title>

<style>
/* ===========================
   THERMAL PRINTER SETTINGS
=========================== */
@page {
    size: 50mm 30mm;
    margin: 0;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
}

/* ===========================
   LABEL LAYOUT
=========================== */
.label {
    width: 50mm;
    height: 30mm;
    padding: 2mm;
    display: flex;
    flex-direction: column;
    justify-content: center;   /* VERTICAL CENTER */
    align-items: center;       /* HORIZONTAL CENTER */
    gap: 1mm;
    overflow: hidden;
}

/* ===========================
   TEXT
=========================== */
.product-meta {
    font-size: 7px;
    font-weight: bold;
    text-align: center;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

/* ===========================
   BARCODE
=========================== */
.barcode-wrapper {
    width: 100%;
    text-align: center;
    overflow: hidden;
}

.barcode-wrapper svg {
    width: 100%;
    height: auto;
}

/* ===========================
   SCREEN PREVIEW ONLY
=========================== */
@media screen {
    body {
        background: #f4f4f4;
        padding: 10px;
    }

    .label {
        border: 1px dashed #999;
        margin-bottom: 10px;
    }
}
</style>
</head>

<body>

@foreach($labels as $label)
<div class="label">
    <div class="product-meta">
        {{ $label['product_name'] }}
        @if(!empty($label['color'])) | {{ $label['color'] }} @endif
        @if(!empty($label['size'])) | {{ $label['size'] }} @endif
    </div>

    <div class="barcode-wrapper">
        <svg class="barcode"
               data-code="{{ $label['barcode_value'] }}">
        </svg>
    </div>
</div>
@endforeach

<script src="{{ asset('js/JsBarcode.all.min.js') }}"></script>

<script>
window.onload = function () {
    document.querySelectorAll('.barcode').forEach(el => {
        JsBarcode(el, el.dataset.code, {
            format: "CODE128",
            displayValue: false,
            fontSize: 6,
            textMargin: 0,
            width: 0.5,
            height: 14,
            margin: 0
        });
    });

    window.print();
};
</script>

</body>
</html>
