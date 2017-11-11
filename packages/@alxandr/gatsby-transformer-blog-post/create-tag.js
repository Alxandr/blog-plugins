const slug = require('slug');
const { createInternal } = require('./create-internal');

const createTag = (
  tag,
  { aux, createNode, getNode, createParentChildLink, parent, createLink },
) => {
  const tagSlug = slug(tag);
  const tagPath = `/tags/${tagSlug}/`;
  const tagId = `Tag < ${tagPath}`;
  let tagNode = getNode(tagId);
  if (tagNode) {
    if (aux.frontmatter.type === 'tag') {
      // TODO: This is a tag page. We want the info here.
    }

    return tagId;
  }

  tagNode = {
    id: tagId,
    children: [],
    parent: parent.id,
  };

  tagNode.name = tag;
  tagNode.slug = tagSlug;
  tagNode.path = tagPath;
  tagNode.internal = createInternal('Tag', tagNode);

  createNode(tagNode);
  if (createLink) {
    createParentChildLink({ parent, child: tagNode });
  }
  return tagId;
};
exports.createTag = createTag;
