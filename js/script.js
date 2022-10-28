jQuery(document).ready(($) => {

	setMatrixSize();
	setBracketsSize();
	changeInputs();
	changeMatrixSizeInputs();

	$('.matrix-wrap').on('keypress', 'input', controls);
	$('.matrix-size').on('input', 'input', matrixSizeInput);

});

$( window ).resize(() => {
	setMatrixSize();
	setBracketsSize();
});

const getArrayOfAttrs = (elements, attr) => {
	const arr = [];
	elements.each((_, e) => 
		arr.push( $(e).attr(attr) )
	);
	return arr;
}

const newInput = (m, r, c) => {
	let res = '<input type="number" data-matrix="'+m+'" data-row="'+r+'" data-column="'+c+'"';
	if( m == "C" ) res += ' disabled';
	res += '>';
	return res;
}

const setMatrixSize = () => {
	let ratio;
	if( $(document).width() <= 800 ) ratio = 570;
	else ratio = 1920;

	const input_width = 78;
	const gap = 8;

	$('.matrix').each((_, e) => {
		const cols = $(e).data('columns');

		$(e).css('max-width', (cols*input_width+(cols-1)*gap) * $(document).width() / ratio);
	});
}

const setBracketsSize = () => {
	let ratio;
	if( $(document).width() <= 800 ) ratio = 570;
	else ratio = 1920;

	$('.bracket').each(function(_, e){
		const m = $(e).data('matrix');
		const mh = $('.matrix[data-matrix="'+m+'"]').data('rows');

		const scale_w = (0.0779*mh + 1.3070) * $(document).width() / ratio;
		const scale_h = (3*mh) * $(document).width() / ratio;

		$(e).css('transform', 'scale('+scale_w+', '+scale_h+')');
	});
}

const changeInputs = () => {
	$('.matrix').each((_, e) => {
		const matrix = $(e).data('matrix');
		const rows = $(e).data('rows');
		const cols = $(e).data('columns');

		const inputs = $(e).children('input');
		const input_count = inputs.length;
		
		if( (rows*cols) < input_count ){
			inputs.each((_, input) => {
				if( $(input).data('row') > rows || $(input).data('column') > cols )
					$(input).remove();
			});
		} else if( (rows*cols) > input_count ){
			let max_row_input = Math.max(...getArrayOfAttrs(inputs, "data-row"));
			let max_col_input = Math.max(...getArrayOfAttrs(inputs, "data-column"));

			if( max_row_input < rows ){
				let diff = rows - max_row_input;
				for (let r = 0; r < diff; r++){
					for (let c = 0; c < max_col_input; c++) {
						$(e).append( newInput(matrix, max_row_input+r+1, c+1) );
					}
				}
				max_row_input = rows;
			}

			if( max_col_input < cols ){
				let diff = cols - max_col_input;
				for (let c = 0; c < diff; c++){
					for (let r = 0; r < max_row_input; r++){
						$(e).children('input[data-row="'+(r+1)+'"][data-column="'+(max_col_input+c)+'"]')
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

const controls = (e) => {
	const $inputs = $('.matrix input');
	const $focused = $('.matrix input:focus');
	const focused_row = $focused.data('row');
	const focused_col = $focused.data('column');

	const $matrix = $('.matrix[data-matrix="'+$focused.data('matrix')+'"]');
	const matrix_rows = $matrix.data('rows');
	const matrix_cols = $matrix.data('columns');

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

const changeMatrixSizeInputs = () => {

	const inputs_rows = $('.matrix-size input.rows');
	const inputs_cols = $('.matrix-size input.cols');

	inputs_rows.each(function(_, e){
		const $matrix = $('.matrix[data-matrix="'+$(e).data('matrix')+'"]');
		$(e).val($matrix.data('rows'));
	});
	inputs_cols.each(function(_, e){
		const $matrix = $('.matrix[data-matrix="'+$(e).data('matrix')+'"]');
		$(e).val($matrix.data('columns'));

		if( $(document).width() <= 800 )
			$(e).attr('max', '6');
	});
}

const matrixSizeInput = (event) => {
	const $matrix = $('.matrix[data-matrix="'+$(event.target).data('matrix')+'"]');

	if( $(event.target).hasClass('rows') )
		$matrix.data('rows', parseInt($(event.target).val()));
	if( $(event.target).hasClass('cols') )
		$matrix.data('columns', parseInt($(event.target).val()));

	changeInputs();
}

const switchMatrixes = () => {
	let $matrix_A = $('.matrix[data-matrix="A"]');
	let $matrix_B = $('.matrix[data-matrix="B"]');

	const $matrix_A_wrap = $matrix_A.parent();
	const $matrix_B_wrap = $matrix_B.parent();

	const matrix_A_values = [];
	$matrix_A.children('input').each((_, e) => {
		matrix_A_values.push( $(e).val() );
	});
	const matrix_B_values = [];
	$matrix_B.children('input').each((_, e) => {
		matrix_B_values.push( $(e).val() );
	});

	const matrix_A_rows = $matrix_A.data('rows');
	const matrix_A_cols = $matrix_A.data('columns');
	const matrix_B_rows = $matrix_B.data('rows');
	const matrix_B_cols = $matrix_B.data('columns');

	$matrix_A_wrap.find('*').data('matrix', 'B');
	$matrix_B_wrap.find('*').data('matrix', 'A');

	$matrix_A_wrap.find('*').attr('data-matrix', 'B');
	$matrix_B_wrap.find('*').attr('data-matrix', 'A');

	const tempA = $matrix_A_wrap.html();

	$matrix_A_wrap.html( $matrix_B_wrap.html() );
	$matrix_B_wrap.html( tempA );

	$matrix_A = $('.matrix[data-matrix="A"]');
	$matrix_B = $('.matrix[data-matrix="B"]');

	$matrix_A.data('rows', matrix_B_rows);
	$matrix_A.data('columns', matrix_B_cols);
	$matrix_B.data('rows', matrix_A_rows);
	$matrix_B.data('columns', matrix_A_cols);

	$matrix_A.children('input').each((i, e) => {
		$(e).val( matrix_B_values[i] );
	});
	$matrix_B.children('input').each((i, e) => {
		$(e).val( matrix_A_values[i] );
	});

	changeInputs();
	changeMatrixSizeInputs();
}

const updateOperators = () => {
	const $matrix_A = $('.matrix[data-matrix="A"]');
	const $matrix_B = $('.matrix[data-matrix="B"]');

	const matrix_A_rows = $matrix_A.data('rows');
	const matrix_A_cols = $matrix_A.data('columns');
	const matrix_B_rows = $matrix_B.data('rows');
	const matrix_B_cols = $matrix_B.data('columns');

	const $sum = $('.operators .sum');
	const $sub = $('.operators .sub');
	const $mul = $('.operators .mul');

	if( matrix_A_rows == matrix_B_rows && matrix_A_cols == matrix_B_cols ){
		$sum.prop('disabled', false);
		$sub.prop('disabled', false);

		$sum.attr('title', "");
		$sub.attr('title', "");
	} else{
		$sum.prop('disabled', true);
		$sub.prop('disabled', true);

		$sum.attr('title', "Matrices should be of the same size!");
		$sub.attr('title', "Matrices should be of the same size!");
	}

	if( matrix_A_rows == matrix_B_cols ){
		$mul.prop('disabled', false);
		$mul.attr('title', "");
	} else {
		$mul.prop('disabled', true);
		$mul.attr('title', "The number of rows of A must coincide with the number of columns of B!");
	}
}

const sum = () => {
	const $matrix_A = $('.matrix[data-matrix="A"]');
	const $matrix_B = $('.matrix[data-matrix="B"]');
	const $matrix_C = $('.matrix[data-matrix="C"]');

	const rows = $matrix_A.data('rows');
	const cols = $matrix_A.data('columns');

	const matrix_A_values = [];
	$matrix_A.children('input').each((_, e) => {
		matrix_A_values.push( parseFloat( $(e).val() ) );
	});
	const matrix_B_values = [];
	$matrix_B.children('input').each((_, e) => {
		matrix_B_values.push( parseFloat( $(e).val() ) );
	});

	$matrix_C.data('rows', rows);
	$matrix_C.data('columns', cols);
	changeInputs();

	$matrix_C.children('input').each((i, e) => {
		$(e).val( matrix_A_values[i] + matrix_B_values[i] );
	});
}

function sub(){
	const $matrix_A = $('.matrix[data-matrix="A"]');
	const $matrix_B = $('.matrix[data-matrix="B"]');
	const $matrix_C = $('.matrix[data-matrix="C"]');

	const rows = $matrix_A.data('rows');
	const cols = $matrix_A.data('columns');

	const matrix_A_values = [];
	$matrix_A.children('input').each((_, e) => {
		matrix_A_values.push( parseFloat( $(e).val() ) );
	});
	const matrix_B_values = [];
	$matrix_B.children('input').each((_, e) => {
		matrix_B_values.push( parseFloat( $(e).val() ) );
	});

	$matrix_C.data('rows', rows);
	$matrix_C.data('columns', cols);
	changeInputs();

	$matrix_C.children('input').each(function(i, e) {
		$(e).val( matrix_A_values[i] - matrix_B_values[i] );
	});
}

const mul = () => {
	const $matrix_A = $('.matrix[data-matrix="A"]');
	const $matrix_B = $('.matrix[data-matrix="B"]');
	const $matrix_C = $('.matrix[data-matrix="C"]');

	const matrix_A_rows = $matrix_A.data('rows');
	const matrix_A_cols = $matrix_A.data('columns');
	const matrix_B_rows = $matrix_B.data('rows');
	const matrix_B_cols = $matrix_B.data('columns');

	$matrix_C.data('rows', matrix_A_rows);
	$matrix_C.data('columns', matrix_B_cols);
	changeInputs();

	const matrix_A_values = [];
	const matrix_B_values = [];
	const matrix_C_values = [];
	for(let i = 0; i < matrix_A_rows; i++){ // Get matrix A values
		matrix_A_values.push([]);
		for(let j = 0; j < matrix_A_cols; j++){
			matrix_A_values[i].push( $matrix_A.children('input[data-row='+(i+1)+'][data-column='+(j+1)+']').val() );
		}
	}
	for(let i = 0; i < matrix_B_rows; i++){ // Get matrix B values
		matrix_B_values.push([]);
		for(let j = 0; j < matrix_B_cols; j++){
			matrix_B_values[i].push( $matrix_B.children('input[data-row='+(i+1)+'][data-column='+(j+1)+']').val() );
		}
	}

	let t = 0;
	for(let i = 0; i < matrix_A_values.length; i++){ // Set matrix C values
		matrix_C_values.push([]);
		for(let j = 0; j < matrix_B_values[0].length; j++){
			for(let k = 0; k < matrix_B_values.length; k++){
				t += matrix_A_values[i][k] * matrix_B_values[k][j];
			}
			matrix_C_values[i].push(t);
			t = 0;
		}
	}
	
	$matrix_C.children('input').each((index, e) => {
		const i = $(e).data('row');
		const j = $(e).data('column');
		$(e).val( matrix_C_values[i-1][j-1] );
	});
}

const mulBy = (m) => {
	const $matrix = $('.matrix[data-matrix="'+m+'"]');
	const k = $('.multiply-by input[data-matrix="'+m+'"]').val();

	$matrix.children('input').each((i, e) => {
		$(e).val( $(e).val() * k );
	});
}

const genRandom = (m) => {
	const $matrix = $('.matrix[data-matrix="'+m+'"]');

	$matrix.children('input').each((i, e) => {
		$(e).val(
			Math.floor( Math.random() * 201 - 100 )
		);
	});
}