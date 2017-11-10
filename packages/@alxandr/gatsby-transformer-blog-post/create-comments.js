const crypto = require('crypto');
const yaml = require('js-yaml');
const fetch = require('cross-fetch');
const { createInternal } = require('./create-internal');

const fetchComments = async ({
  commentsApiGateway,
  issue,
  createNode,
  post,
}) => {
  const response = await fetch(`${commentsApiGateway}/${issue}`);
  const comments = await response.json();
  for (const comment of comments) {
    const { body, ...meta } = comment;
    const frontmatter = yaml.safeDump(
      Object.assign({}, meta, { type: 'comment', post }),
    );
    const content = `---\n${frontmatter}\n---\n\n${body}`;
    const node = {
      id: `CommentGateway < ${comment.key}`,
      parent: '___SOURCE___',
      children: [],
      internal: {
        mediaType: 'text/x-markdown',
        type: 'CommentMarkdown',
        content,
        contentDigest: crypto
          .createHash('md5')
          .update(content)
          .digest('hex'),
      },
    };

    createNode(node);
  }
};

exports.fetchComments = fetchComments;

const createComment = async ({
  aux,
  createNode,
  getNode,
  node,
  createParentChildLink,
}) => {
  const { frontmatter } = aux;
  const commentsNodeId = `Comments < ${frontmatter.post}`;
  const commentNode = Object.assign({}, frontmatter, {
    id: `Comment < ${frontmatter.key}`,
    children: [],
    parent: node.id,
    user: Object.assign({}, frontmatter.user),
  });

  commentNode.internal = createInternal('Comment', commentNode);

  const commentsNode = getNode(commentsNodeId);
  const comments = [
    ...((commentsNode && commentsNode.comments) || []),
    commentNode.id,
  ];
  const newCommentsNode = {
    id: commentsNodeId,
    children: [],
    parent: '___SOURCE___',
    comments,
  };

  newCommentsNode.internal = createInternal('Comments', newCommentsNode);

  createNode(commentNode);
  createNode(newCommentsNode);
  createParentChildLink({ parent: node, child: commentNode });
};

exports.createComment = createComment;
