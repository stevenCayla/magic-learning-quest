export function buildVersion(releaseTag, packageVersion) {
  if (releaseTag) {
    if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/.test(releaseTag))
      throw new Error('Le tag de release doit être au format v1.2.3');
    return {
      version: releaseTag,
      release: true,
      url: `https://github.com/stevenCayla/magic-learning-quest/releases/tag/${releaseTag}`,
    };
  }
  return { version: `v${packageVersion}-dev`, release: false, url: '' };
}

export function validateReleaseMetadata(info, tag, commit) {
  const expected = buildVersion(tag, '');
  if (
    !tag ||
    info?.version !== tag ||
    info?.release !== true ||
    info?.commit !== commit ||
    info?.url !== expected.url
  )
    throw new Error('Les métadonnées du build ne correspondent pas à la release et à son commit');
  return info;
}
