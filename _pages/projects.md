---
title: "Siddhant Bansal - Experience"
layout: gridlay
excerpt: "Siddhant Bansal: Experience"
sitemap: false
permalink: /projects
---

<h3>Projects</h3>

{% for proj in site.data.projects %}

<div class="col-sm-11 clearfix">
 <div class="well">
 <pubtit>{{ proj.title }}</pubtit>

 <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/{{ proj.image }}" class="img-responsive" width="200px" style="float: left" />

 <p>{{ proj.description }}</p>

 {% if proj.number_link == 1 %}
 <p><a href="{{ proj.link1.url }}">{{ proj.link1.display }}</a></p>
 {% endif %}

 {% if proj.number_link == 2 %}
 <p><a href="{{ proj.link1.url }}">{{ proj.link1.display }}</a>
 /
 <a href="{{ proj.link2.url }}">{{ proj.link2.display }}</a></p>
 {% endif %}

 {% if proj.number_link == 3 %}
 <p><a href="{{ proj.link1.url }}">{{ proj.link1.display }}</a>
 /
 <a href="{{ proj.link2.url }}">{{ proj.link2.display }}</a>
 /
 <a href="{{ proj.link3.url }}">{{ proj.link3.display }}</a></p>
 {% endif %}
 
 {% if proj.number_link == 4 %}
 <p><a href="{{ proj.link1.url }}">{{ proj.link1.display }}</a>
 /
 <a href="{{ proj.link2.url }}">{{ proj.link2.display }}</a>
 /
 <a href="{{ proj.link3.url }}">{{ proj.link3.display }}</a>
 /
 <a href="{{ proj.link4.url }}">{{ proj.link4.display }}</a></p>
 {% endif %}

 {% if proj.number_link == 5 %}
 <p><a href="{{ proj.link1.url }}">{{ proj.link1.display }}</a>
 /
 <a href="{{ proj.link2.url }}">{{ proj.link2.display }}</a>
 /
 <a href="{{ proj.link3.url }}">{{ proj.link3.display }}</a>
 /
 <a href="{{ proj.link4.url }}">{{ proj.link4.display }}</a>
 /
 <a href="{{ proj.link5.url }}">{{ proj.link5.display }}</a></p>
 {% endif %}

 </div>
</div>

{% endfor %}

<p> &nbsp; </p>
