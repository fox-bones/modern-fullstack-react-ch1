import { editPost } from '../api/posts.js'
import { Post } from './Post.jsx'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import PropTypes from 'prop-types'

EditPost.propTypes = {
	post: PropTypes.shape(Post.PropTypes),
}

export function EditPost({ post }) {
	const [isEditing, setIsEditing] = useState(false)
	const [title, setTitle] = useState(post.title)
	const [author, setAuthor] = useState(post.author)
	const [content, setContent] = useState(post.contents)

	const [tagList, setTagList] = useState(post.tags ?? [])
	const [tag, setTag] = useState('')
	const [tagError, setTagError] = useState('')

	function addTag(tag) {
		const normalizedTag = tag.trim().toLowerCase()

		if (!normalizedTag) {
			setTagError('tag cannot be empty')
			return
		}

		if (tagList.includes(normalizedTag)) {
			setTagError('tags must be unique')
			return
		}

		setTagList((currentTags) => [...currentTags, normalizedTag])
		setTag('')
		setTagError('')
	}

	const queryClient = useQueryClient()

	const editPostMutation = useMutation({
		mutationFn: () =>
			editPost(post._id, {
				title,
				author,
				content,
				tags: tagList,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries(['posts'])
			setIsEditing(false)
		},
	})

	const onSubmit = (e) => {
		e.preventDefault()
		editPostMutation.mutate()
	}

	if (!isEditing) {
		return (
			<button
				className="btn btn-ghost btn-edit-trigger"
				onClick={() => setIsEditing(true)}
			>
				Edit
			</button>
		)
	}

	return (
		<form className="edit-post-form" onSubmit={onSubmit}>
			<div className="field">
				<label htmlFor={`title-${post._id}`}>Title: </label>
				<input
					id={`title-${post._id}`}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
			</div>
			<div className="field">
				<label htmlFor={`author-${post._id}`}>Author: </label>
				<input
					id={`author-${post._id}`}
					value={author}
					onChange={(e) => setAuthor(e.target.value)}
				/>
			</div>
			<div className="field">
				<label htmlFor={`content-${post._id}`}>Content: </label>
				<input
					id={`content-${post._id}`}
					value={content}
					onChange={(e) => setContent(e.target.value)}
				/>
			</div>
			<div className="field">
				<label htmlFor={`tag-${post._id}`}>Tags: </label>
				<div className="field tag-row">
					<input
						id={`tag-${post._id}`}
						value={tag}
						onChange={(e) => setTag(e.target.value)}
					/>

					<button
						type="button"
						className="btn btn-ghost"
						onClick={() => addTag(tag)}
					>
						Add Tag
					</button>
				</div>

				<div>
					{tagList.map((tag) => (
						<span key={tag} className="edit-post-tags">
							{tag}
							<button
								className="edit-post-tags-x"
								type="button"
								onClick={() =>
									setTagList((currentTags) =>
										currentTags.filter(
											(item) => item !== tag,
										),
									)
								}
							>
								x
							</button>
						</span>
					))}
				</div>
				<div>
					{tagError && <p className="field-error">{tagError}</p>}
				</div>
			</div>

			<div className="edit-post-actions">
				<button
					type="submit"
					className="btn btn-primary"
					disabled={editPostMutation.isPending}
				>
					Save
				</button>

				<button
					type="button"
					className="btn btn-ghost"
					onClick={() => {
						setIsEditing(false)
						setTagError('')
					}}
				>
					Cancel
				</button>
			</div>
		</form>
	)
}
