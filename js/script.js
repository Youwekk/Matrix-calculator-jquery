jQuery(document).ready(function($){

	setMatrixSize();
	setBracketsSize();
	changeInputs();
	changeMatrixSizeInputs();

	$('.matrix-wrap').on('keypress', 'input', controls);
	$('.matrix-size').on('input', 'input', matrixSizeInput);

});

$( window ).resize(function() {
	setMatrixSize();
	setBracketsSize();
});

function getArray(elem, attr) {
	return elem.map(function() {
	  return $(this).attr(attr);
	}).toArray();
}

function newInput(m, r, c){
	var res = '<input type="number" data-matrix="'+m+'" data-row="'+r+'" data-column="'+c+'"';
	if( m == "C" ) res += ' disabled';
	res += '>';
	return res;
}

function setMatrixSize() {
	if( $(document).width() <= 800 ) var ratio = 570;
	else var ratio = 1920;

	$('.matrix').each(function(i, e){
		var cols = $(this).data('columns');
		var input_width = 78;
		var gap = 8;

		$(this).css('max-width', (cols*input_width+(cols-1)*gap) * $(document).width() / ratio);
	});
}

function setBracketsSize() {
	if( $(document).width() <= 800 ) var ratio = 570;
	else var ratio = 1920;

	$('.bracket').each(function(i, e){
		var m = $(this).data('matrix');
		var mh = $('.matrix[data-matrix="'+m+'"]').data('rows');

		var scale_w = (0.0779*mh + 1.3070) * $(document).width() / ratio;
		var scale_h = (3*mh) * $(document).width() / ratio;

		$(this).css('transform', 'scale('+scale_w+', '+scale_h+')');
	});
}

function changeInputs(){
	$('.matrix').each(function(i, e){
		var matrix = $(this).data('matrix');
		var rows = $(this).data('rows');
		var cols = $(this).data('columns');

		var inputs = $(this).children('input');
		var input_count = inputs.length;
		
		if( (rows*cols) < input_count ){
			inputs.each(function(i, e){
				if( $(this).data('row') > rows || $(this).data('column') > cols )
					$(this).remove();
			});
		} else if( (rows*cols) > input_count ){
			var max_row_input = Math.max(...getArray(inputs, "data-row"));
			var max_col_input = Math.max(...getArray(inputs, "data-column"));

			if( max_row_input < rows ){
				var diff = rows - max_row_input;
				for (var r = 0; r < diff; r++){
					for (var c = 0; c < max_col_input; c++) {
						$(this).append( newInput(matrix, max_row_input+r+1, c+1) );
					}
				}
				max_row_input = rows;
			}

			if( max_col_input < cols ){
				var diff = cols - max_col_input;
				for (var c = 0; c < diff; c++){
					for (var r = 0; r < max_row_input; r++){
						$(this).children('input[data-row="'+(r+1)+'"][data-column="'+(max_col_input+c)+'"]')
							.after( newInput(matrix, r+1, max_col_input+c+1) );
					}
				}
			}
		}
	});

	setMatrixSize();
	setBracketsSize();
	updateOperators();
}

function controls(e){
	var $inputs = $('.matrix input');
	var $focused = $('.matrix input:focus');
	var focused_row = $focused.data('row');
	var focused_col = $focused.data('column');

	var $matrix = $('.matrix[data-matrix="'+$focused.data('matrix')+'"]');
	var matrix_rows = $matrix.data('rows');
	var matrix_cols = $matrix.data('columns');

	if( e.which == 32 ){ // Space bar
		if( focused_col < matrix_cols ){
			$focused.trigger('blur');
			$matrix.children('input[data-row="'+focused_row+'"][data-column="'+(focused_col+1)+'"]').trigger('focus');
		} else if( $matrix.data('columns') < 8 ) {
			$matrix.data('columns', $matrix.data('columns')+1);
			changeInputs();
			changeMatrixSizeInputs();
			$matrix.children('input[data-row="'+focused_row+'"][data-column="'+(focused_col+1)+'"]').trigger('focus');
		}
	} else if( e.which == 13 ){ // Enter
		if( focused_row < matrix_rows ){
			$focused.trigger('blur');
			$matrix.children('input[data-row="'+(focused_row+1)+'"][data-column="1"]').trigger('focus');
		} else {
			$matrix.data('rows', $matrix.data('rows')+1);
			changeInputs();
			changeMatrixSizeInputs();
			$matrix.children('input[data-row="'+(focused_row+1)+'"][data-column="1"]').trigger('focus');
		}
	}
}

function changeMatrixSizeInputs(){

	var inputs_rows = $('.matrix-size input.rows');
	var inputs_cols = $('.matrix-size input.cols');

	inputs_rows.each(function(i, e){
		var $matrix = $('.matrix[data-matrix="'+$(this).data('matrix')+'"]');
		$(this).val($matrix.data('rows'));
	});
	inputs_cols.each(function(i, e){
		var $matrix = $('.matrix[data-matrix="'+$(this).data('matrix')+'"]');
		$(this).val($matrix.data('columns'));

		if( $(document).width() <= 800 )
			$(this).attr('max', '6');
	});
}

function matrixSizeInput(){
	var $matrix = $('.matrix[data-matrix="'+$(this).data('matrix')+'"]');

	if( $(this).hasClass('rows') )
		$matrix.data('rows', parseInt($(this).val()));
	if( $(this).hasClass('cols') )
		$matrix.data('columns', parseInt($(this).val()));

	changeInputs();
}

function switchMatrixes(){
	var $matrix_A = $('.matrix[data-matrix="A"]');
	var $matrix_B = $('.matrix[data-matrix="B"]');

	var $matrix_A_wrap = $matrix_A.parent();
	var $matrix_B_wrap = $matrix_B.parent();

	var matrix_A_values = $matrix_A.children('input').map(function(){
		return $(this).val();
	}).get();
	var matrix_B_values = $matrix_B.children('input').map(function(){
		return $(this).val();
	}).get();

	var matrix_A_rows = $matrix_A.data('rows');
	var matrix_A_cols = $matrix_A.data('columns');
	var matrix_B_rows = $matrix_B.data('rows');
	var matrix_B_cols = $matrix_B.data('columns');

	$matrix_A_wrap.find('*').data('matrix', 'B');
	$matrix_B_wrap.find('*').data('matrix', 'A');

	$matrix_A_wrap.find('*').attr('data-matrix', 'B');
	$matrix_B_wrap.find('*').attr('data-matrix', 'A');

	var tempA = $matrix_A_wrap.html();

	$matrix_A_wrap.html( $matrix_B_wrap.html() );
	$matrix_B_wrap.html( tempA );

	$matrix_A = $('.matrix[data-matrix="A"]');
	$matrix_B = $('.matrix[data-matrix="B"]');

	$matrix_A.data('rows', matrix_B_rows);
	$matrix_A.data('columns', matrix_B_cols);
	$matrix_B.data('rows', matrix_A_rows);
	$matrix_B.data('columns', matrix_A_cols);

	$matrix_A.children('input').each(function(i, e) {
		$(this).val( matrix_B_values[i] );
	});
	$matrix_B.children('input').each(function(i, e) {
		$(this).val( matrix_A_values[i] );
	});

	changeInputs();
	changeMatrixSizeInputs();
}

function updateOperators(){
	var $matrix_A = $('.matrix[data-matrix="A"]');
	var $matrix_B = $('.matrix[data-matrix="B"]');

	var matrix_A_rows = $matrix_A.data('rows');
	var matrix_A_cols = $matrix_A.data('columns');
	var matrix_B_rows = $matrix_B.data('rows');
	var matrix_B_cols = $matrix_B.data('columns');

	var $sum = $('.operators .sum');
	var $sub = $('.operators .sub');
	var $mul = $('.operators .mul');

	if( matrix_A_rows == matrix_B_rows && matrix_A_cols == matrix_B_cols ){
		$sum.prop('disabled', false);
		$sub.prop('disabled', false);

		$sum.attr('title', "");
		$sub.attr('title', "");
	} else{
		$sum.prop('disabled', true);
		$sub.prop('disabled', true);

		$sum.attr('title', "Матрицы должны быть одинакового размера!");
		$sub.attr('title', "Матрицы должны быть одинакового размера!");
	}

	if( matrix_A_rows == matrix_B_cols ){
		$mul.prop('disabled', false);
		$mul.attr('title', "");
	} else {
		$mul.prop('disabled', true);
		$mul.attr('title', "Колличество строк матрицы A должно совпадать с колличеством столбцов матрицы B!");
	}
}

function sum(){
	var $matrix_A = $('.matrix[data-matrix="A"]');
	var $matrix_B = $('.matrix[data-matrix="B"]');
	var $matrix_C = $('.matrix[data-matrix="C"]');

	var rows = $matrix_A.data('rows');
	var cols = $matrix_A.data('columns');

	var matrix_A_values = $matrix_A.children('input').map(function(){
		return parseFloat( $(this).val() );
	}).get();
	var matrix_B_values = $matrix_B.children('input').map(function(){
		return parseFloat( $(this).val() );
	}).get();

	$matrix_C.data('rows', rows);
	$matrix_C.data('columns', cols);
	changeInputs();

	$matrix_C.children('input').each(function(i, e) {
		$(this).val( matrix_A_values[i] + matrix_B_values[i] );
	});
}

function sub(){
	var $matrix_A = $('.matrix[data-matrix="A"]');
	var $matrix_B = $('.matrix[data-matrix="B"]');
	var $matrix_C = $('.matrix[data-matrix="C"]');

	var rows = $matrix_A.data('rows');
	var cols = $matrix_A.data('columns');

	var matrix_A_values = $matrix_A.children('input').map(function(){
		return parseFloat( $(this).val() );
	}).get();
	var matrix_B_values = $matrix_B.children('input').map(function(){
		return parseFloat( $(this).val() );
	}).get();

	$matrix_C.data('rows', rows);
	$matrix_C.data('columns', cols);
	changeInputs();

	$matrix_C.children('input').each(function(i, e) {
		$(this).val( matrix_A_values[i] - matrix_B_values[i] );
	});
}

function mul(){
	var $matrix_A = $('.matrix[data-matrix="A"]');
	var $matrix_B = $('.matrix[data-matrix="B"]');
	var $matrix_C = $('.matrix[data-matrix="C"]');

	var matrix_A_rows = $matrix_A.data('rows');
	var matrix_A_cols = $matrix_A.data('columns');
	var matrix_B_rows = $matrix_B.data('rows');
	var matrix_B_cols = $matrix_B.data('columns');

	$matrix_C.data('rows', matrix_A_rows);
	$matrix_C.data('columns', matrix_B_cols);
	changeInputs();

	var matrix_A_values = [];
	var matrix_B_values = [];
	var matrix_C_values = [];
	for(var i = 0; i < matrix_A_rows; i++){ // Get matrix A values
		matrix_A_values.push([]);
		for(var j = 0; j < matrix_A_cols; j++){
			matrix_A_values[i].push( $matrix_A.children('input[data-row='+(i+1)+'][data-column='+(j+1)+']').val() );
		}
	}
	for(var i = 0; i < matrix_B_rows; i++){ // Get matrix B values
		matrix_B_values.push([]);
		for(var j = 0; j < matrix_B_cols; j++){
			matrix_B_values[i].push( $matrix_B.children('input[data-row='+(i+1)+'][data-column='+(j+1)+']').val() );
		}
	}

	var t = 0;
	for(var i = 0; i < matrix_A_values.length; i++){ // Set matrix C values
		matrix_C_values.push([]);
		for(var j = 0; j < matrix_B_values[0].length; j++){
			for(var k = 0; k < matrix_B_values.length; k++){
				t += matrix_A_values[i][k] * matrix_B_values[k][j];
			}
			matrix_C_values[i].push(t);
			t = 0;
		}
	}
	
	$matrix_C.children('input').each(function(i, e) {
		var i = $(this).data('row');
		var j = $(this).data('column');
		$(this).val( matrix_C_values[i-1][j-1] );
	});
}

function mulBy(m) {
	var $matrix = $('.matrix[data-matrix="'+m+'"]');
	var k = $('.multiply-by input[data-matrix="'+m+'"]').val();

	$matrix.children('input').each(function(i, e) {
		$(this).val( $(this).val() * k );
	});
}

function genRandom(m) {
	var $matrix = $('.matrix[data-matrix="'+m+'"]');

	$matrix.children('input').each(function(i, e) {
		$(this).val(
			Math.floor( Math.random() * 201 - 100 )
		);
	});
}