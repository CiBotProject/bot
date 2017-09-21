# Design Milestone

## 1. Problem Statement

Continuous integration (CI) is an approach to the software development process in which disparate working branches are constantly merged with the master branch, oftentimes with each incremental change or added feature.  One of the main advantages of CI is that it avoids “integration hell,” a circumstance that arises from individual team members working on separate branches for extended periods of time, greatly increasing their chances of producing incompatible code that will take an inordinate amount of time and effort to integrate.  CI tools typically facilitate CI by performing automated builds of and tests on the code base, either at set time intervals or in response to events such as pushes to or merges with the master branch.  By successively performing builds and tests, CI allows bugs and other errors to be discovered and resolved consistently throughout the development process.  In this way, CI becomes a natural complement to test-driven development, and allows stable, deployable code to be produced throughout the development cycle.

However, these advantages also come with a cost.  Due to the necessity of formulating a strategy for the commit cycle of a project up front, there can be higher time requirements for CI projects in the beginning phases than for non-CI projects.  In the likely case that CI tools will be used for a project, this initial time overhead is increased, as the tools themselves must be set up and then customized for specific projects.  Many CI tools have sought to simplify this initial setup process, but many only provide partial solutions.  Let us take Travis CI, one of the most popular CI tools, as an example.  Through its GitHub app, Travis CI has made account creation and activation as simple as logging into their website your GitHub account, then clicking a button next to the repo that you want to enable Travis CI services on.  At this point, however, any further customization needs to be done through editing the .travis.yml file, and while the documentation for doing so is fairly good, the process can still seem somewhat arcane to novice users (in fact, it is one of the most [common complaints][1] about Travis CI).  We’ll refer to this as CI’s “inaccessibility” problem.

Another barrier to using CI effectively results from the fact that CI is inherently dependent upon the total participation of the contributors to a code base, their adherence to a tightly-constrained commit cycle, and their willingness to pause development to resolve errors as they occur.  This can lead to several undesirable outcomes.  On the one hand, when a build fails, a project can grind to a halt as team members shift focus away from their currently assigned tasks in order to resolve the errors introduced into the code base.  On the other hand, if builds fail regularly due to simple and easily-remedied mistakes, the entire team can eventually abandon the CI approach entirely by simply ignoring the status of the builds and continuing on with their work as the would otherwise.  Some have argued that these outcomes [completely negate the usefulness of CI][2].  We’ll refer to this as CI’s “rigidity” problem.

A third and final problem with CI is that it oftentimes relies upon a variety of services and endpoints to function optimally, many of which are maintained from completely separate user interfaces.  Even with services that are well-linked, like Travis CI and GitHub, certain tasks still require searching back and forth between the interfaces of the disparate tools.  It is often desirable to include tools such as coverage analyzers or deployment platforms in the CI process, but each added service effectively adds another layer of settings and configurations for the users to keep track of and navigate through, discouraging developers from taking full advantage of the benefits that CI could offer.  We’ll refer to this as CI’s “decentralized workflow” problem.

If these problems of inaccessiblity, rigidity, and decentralized work flow were resolved, CI could be opened up to a broader base of users who are able to take full advantage of its strengths and benefits.

[1]: https://www.g2crowd.com/products/travis-ci/reviews
[2]: http://www.yegor256.com/2014/10/08/continuous-integration-is-dead.html

## 2. Bot Description

## 3. Use Cases

## 4. Design Sketches

## 5. Architecture Design