// file: save.js
/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * This component is responsible for what is saved to the post content.
 * Since this is a dynamic block, we only save a simple container. The front-end
 * rendering is handled entirely by the `view.js` script.
 */
export default function save() {
	const blockProps = useBlockProps.save();
	return (
		<div {...blockProps}>
			{/* A simple placeholder that `view.js` will use to render the dynamic content. */}
			<div className="aag-data-table-placeholder"></div>
		</div>
	);
}
