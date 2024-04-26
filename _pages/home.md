---
title: "Siddhant Bansal - Home"
layout: gridlay
excerpt: "Siddhant Bansal"
sitemap: false
permalink: /
---

<div class="container-fluid">

<div class="row">

<div class="col-sm-8">

<div style="text-align: justify">
I am a second-year PhD student at the <a href="https://uob-mavi.github.io/people/">University of Bristol</a> working with <a href="https://dimadamen.github.io">Prof. Dima Damen</a>.
My research interest is Computer Vision, Pattern Recognition, and Machine Learning. 
Currently, I am working on devising learning-based methods for understanding and exploring various aspects of first-person (egocentric) vision.
Previously, at <a href="http://cvit.iiit.ac.in">CVIT, IIIT Hyderabad</a>, I worked with <a href="https://faculty.iiit.ac.in/~jawahar/index.html">Prof. C.V. Jawahar</a> and <a href='https://www.cse.iitd.ac.in/~chetan/'>Prof. Chetan Arora</a> on <a href="https://sid2697.github.io/egoprocel/">unsupervised procedure learning</a> from egocentric videos.
<!-- I am an MS by Research candidate at <a href="http://cvit.iiit.ac.in">CVIT, IIIT Hyderabad</a>. I work with <a href="https://faculty.iiit.ac.in/~jawahar/index.html">Prof. C.V. Jawahar</a> and <a href='https://www.cse.iitd.ac.in/~chetan/'>Prof. Chetan Arora</a>. -->
Earlier, I worked on improving word recognition and retrieval in large document collection with <a href="https://faculty.iiit.ac.in/~jawahar/index.html">Prof. C.V. Jawahar</a> and on 3D Computer Vision with <a href="https://people.iitgn.ac.in/~shanmuga/">Prof. Shanmuganathan Raman</a>.
</div>

<div style="text-align: justify">
My ultimate goal is to contribute to the development of systems capable of understanding the world as we do. I'm an inquisitive person, and I'm always willing to learn about fields including, but not limited to, science, technology, astrophysics, and physics.
</div>

<p align="center">
  <a href="./docs/Siddhant_Bansal.pdf">CV</a> /
  <a href="https://scholar.google.com/citations?hl=en&user=ciok5VwAAAAJ">Google Scholar</a> /
  <a href="https://github.com/Sid2697">Github</a> /
  <a href="https://www.linkedin.com/in/siddhant-bansal/">LinkedIn</a> /
  <a href="https://arxiv.org/a/bansal_s_1.html"> arXiv </a> /
  <a href="https://orcid.org/0000-0003-2636-0066">ORCID</a>
</p>

### News
****
{% for article in site.data.news limit:7 %}
{{ article.date }} :
<em>{{ article.headline }}</em>
{% endfor %}
#### <a href="{{ site.url }}{{ site.baseurl }}/allnews.html">See all news</a>

</div>

<div class="col-sm-4" style="display:table-cell; vertical-align:left; text-align:left">

  <ul style="overflow: hidden">
  <img src="{{ site.url }}{{ site.baseurl }}/images/profile_pic.jpeg" class="img-responsive" width="100%" />
  </ul>

  <!-- <br clear="all" /> -->
<div style="text-align: right">
  Machine Learning and Computer Vision (<b>MaVi</b>) @
  University of Bristol
</div>

</div>

</div>
</div>

<div class="col-sm-12">

### Publications
****

{% for publi in site.data.publist limit:5 %}

<div class="col-sm-11 clearfix">
 <div class="well">
 <pubtit>{{ publi.title }}</pubtit>

 <img src="{{ site.url }}{{ site.baseurl }}/images/pubpic/{{ publi.image }}" class="img-responsive" width="250px" style="float: left" />

<div style="text-align: justify">
 <p>{{ publi.description }}</p>
</div>

<div style="text-align: justify">
 <p><em>{{ publi.authors }}</em></p>
</div>

 <p>{{ publi.venue }}</p>

 {% if publi.number_link == 1 %}
 <p><a href="{{ publi.link1.url }}">{{ publi.link1.display }}</a></p>
 {% endif %}

 {% if publi.number_link == 2 %}
 <p><a href="{{ publi.link1.url }}">{{ publi.link1.display }}</a>
 /
 <a href="{{ publi.link2.url }}">{{ publi.link2.display }}</a></p>
 {% endif %}

 {% if publi.number_link == 3 %}
 <p><a href="{{ publi.link1.url }}">{{ publi.link1.display }}</a>
 /
 <a href="{{ publi.link2.url }}">{{ publi.link2.display }}</a>
 /
 <a href="{{ publi.link3.url }}">{{ publi.link3.display }}</a></p>
 {% endif %}

 {% if publi.number_link == 4 %}
 <p><a href="{{ publi.link1.url }}">{{ publi.link1.display }}</a>
 /
 <a href="{{ publi.link2.url }}">{{ publi.link2.display }}</a>
 /
 <a href="{{ publi.link3.url }}">{{ publi.link3.display }}</a>
 /
 <a href="{{ publi.link4.url }}">{{ publi.link4.display }}</a></p>
 {% endif %}

 {% if publi.number_link == 5 %}
 <p><a href="{{ publi.link1.url }}">{{ publi.link1.display }}</a>
 /
 <a href="{{ publi.link2.url }}">{{ publi.link2.display }}</a>
 /
 <a href="{{ publi.link3.url }}">{{ publi.link3.display }}</a>
 /
 <a href="{{ publi.link4.url }}">{{ publi.link4.display }}</a>
 /
 <a href="{{ publi.link5.url }}">{{ publi.link5.display }}</a></p>
 {% endif %}

 </div>
</div>

{% endfor %}

<br clear="all"/>

#### <a href="{{ site.url }}{{ site.baseurl }}/publications">See all publications</a>

</div>

<div class="col-sm-12">

### Miscellaneous
****
#### Invited Talks

* Egocentric Videos for Procedure Learning @ [Indian Conference on Computer Vision, Graphics and Image Processing (ICVGIP 2022)](https://events.iitgn.ac.in/2022/icvgip/index.html) ([Vision India](https://events.iitgn.ac.in/2022/icvgip/vision_india.html)). [[slides](https://iiitaphyd-my.sharepoint.com/:p:/g/personal/siddhant_bansal_research_iiit_ac_in/EbxapAwL-hxCjJyEMYa8aXgBHeKsYTbhqonfQzT0hUIltg?e=W9z8Ki); [tweet](https://twitter.com/Sid__Bansal/status/1602165700424273920?s=20&t=BOQDMb1dCMppgcCjHaA9KA); [linkedin](https://www.linkedin.com/posts/siddhant-bansal_icvgip2022-eccv2022-activity-7007934958484746240-wBva?utm_source=share&utm_medium=member_desktop)]

* Egocentric Videos for Procedure Learning @ [IPLAB, University of Catania](https://iplab.dmi.unict.it/fpv/) [[slides](https://iiitaphyd-my.sharepoint.com/:p:/g/personal/siddhant_bansal_research_iiit_ac_in/ERc_foZHgKZEnG9xhQKvXS8BWeQOgosXJCpnhM1YBad98Q?e=C4eyS4); [tweet](https://twitter.com/Sid__Bansal/status/1588149526459736064?s=20&t=CTjlbGTkjcmHUS8tbbJ0Qw)]

* Egocentric Videos for Procedure Learning @ [Computer Vision Centre, Universitat Autònoma de Barcelona](http://www.cvc.uab.es) [[slides](https://iiitaphyd-my.sharepoint.com/:p:/g/personal/siddhant_bansal_research_iiit_ac_in/EX5YUA772apKte6EsNcZX4IBwVh5Xz4cmWGvDAvXmYzm2w?e=KvoTKi); [tweet](https://twitter.com/dkaratzas/status/1590723083198873604?s=20&t=EAKrnmTUI0IsHTh5mQ98Tw)]

#### Workshop Organizer

* [Joint International 3rd Ego4D and 11th EPIC Workshop @ CVPR 2023](https://sites.google.com/view/ego4d-epic-cvpr2023-workshop/home)
* [2nd International Ego4D Workshop @ ECCV 2022](https://ego4d-data.org/workshops/eccv22/)

#### Conference Reviewer

* CVPR 2022, 2023, 2024
* ICCV 2023
* ECCV 2022, 2024
* WACV 2023, 2024

#### Journal Reviewer

* IEEE Transactions on Pattern Analysis and Machine Intelligence ([T-PAMI](https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=34))
* International Journal of Computer Vision ([IJCV](https://link.springer.com/journal/11263))
* Computer Vision and Image Understanding ([CVIU](https://www.sciencedirect.com/journal/computer-vision-and-image-understanding))

#### Workshop Reviewer

* [Joint 1st Ego4D and 10th EPIC Workshop @ CVPR 2022](https://sites.google.com/view/cvpr2022w-ego4d-epic/)


#### Thesis

* Masters: <a href='../papers/masters_thesis.pdf'>I-Do, You-Learn: Techniques for Unsupervised Procedure Learning using Egocentric Videos</a>

<p> &nbsp; </p>

### Blog
****
{% for item in site.data.blog limit:3 %}
### {{item.title}}
{{item.desc}}
#### <a href='{{item.link}}'>Link</a> to the article!
{% endfor %}

<p> &nbsp; </p>
#### <a href="https://sid2697.github.io/Blog_Sid">See all articles</a>

<p> &nbsp; </p>

</div>
