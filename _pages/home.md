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

I am an MS by Research candidate at <a href="http://cvit.iiit.ac.in">CVIT, IIIT Hyderabad</a>. I'm guided by <a href="https://faculty.iiit.ac.in/~jawahar/index.html">Prof. C.V. Jawahar</a> and co-guided by <a href='https://www.cse.iitd.ac.in/~chetan/'>Prof. Chetan Arora</a>.
My research interest lies in Computer Vision, Pattern Recognition, and Machine Learning. My graduate research focuses on devising learning-based methods for understanding and exploring various aspects of first-person (egocentric) vision. Earlier, I worked on improving word recognition and retrieval in large document collection under the guidance of <a href="https://faculty.iiit.ac.in/~jawahar/index.html">Prof. C.V. Jawahar</a>. Previously, I worked with <a href='https://people.iitgn.ac.in/~shanmuga/'>Prof. Shanmuganathan Raman</a> on 3D Computer Vision.

My ultimate goal is to contribute to the development of systems capable of understanding the world as we do. I'm an inquisitive person, and I'm always willing to learn about fields including, but not limited to, science, technology, astrophysics, and physics.

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
{% for article in site.data.news limit:5 %}
{{ article.date }} :
<em>{{ article.headline }}</em>
{% endfor %}
#### <a href="{{ site.url }}{{ site.baseurl }}/allnews.html">See all news</a>

</div>

<div class="col-sm-4" style="display:table-cell; vertical-align:middle; text-align:left">

  <ul style="overflow: hidden">
  <img src="{{ site.url }}{{ site.baseurl }}/images/profile_pic.jpeg" class="img-responsive" width="100%" />
  </ul>

  <!-- <br clear="all" /> -->

  <A HREF="mailto:siddhant.bansal@research.iiit.ac.in">siddhant.bansal@research.iiit.ac.in</A> <br>
  Center for Visual Information and Technology (<b>CVIT</b>), 
  International Institute of Information Technology (<b>IIIT</b>),
  Hyderabad, India.<br>


</div>

</div>
</div>

<div class="col-sm-12">

### Publications
****

{% for publi in site.data.publist limit:10 %}

<div class="col-sm-11 clearfix">
 <div class="well">
 <pubtit>{{ publi.title }}</pubtit>

 <img src="{{ site.url }}{{ site.baseurl }}/images/pubpic/{{ publi.image }}" class="img-responsive" width="200px" style="float: left" />

 <p>{{ publi.description }}</p>

 <p><em>{{ publi.authors }}</em></p>

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
