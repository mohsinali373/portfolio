// GLSL injected into MeshPhysicalMaterial so the liquid form keeps three.js'
// physically based lighting, environment reflections and tone mapping.
//
// The base geometry is a unit sphere. Each vertex direction is projected onto a
// superellipsoid (uShape half-extents, uExp squareness) and blended by uMorph,
// so one mesh can become a liquid drop, a screen panel, a module block, a server
// tower or a flat pool. Layered simplex noise and a pointer bulge are then
// applied, and normals are recomputed analytically.

// 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT).
const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const liquidHeader = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform vec3 uPointerDir;
uniform float uPointerStrength;
uniform vec3 uShape;
uniform float uExp;
uniform float uMorph;
${simplexNoise}
vec3 shapeBase(vec3 d){
  vec3 q = abs(d) / uShape;
  float r = pow(pow(q.x, uExp) + pow(q.y, uExp) + pow(q.z, uExp), -1.0 / uExp);
  return mix(d, d * r, uMorph);
}
float liquidField(vec3 d){
  vec3 flow = vec3(uTime * 0.09, uTime * 0.14, -uTime * 0.06);
  float n = snoise(d * uFreq + flow);
  n += 0.18 * snoise(d * uFreq * 1.9 - flow * 1.3);
  float pull = pow(max(dot(d, uPointerDir), 0.0), 7.0) * uPointerStrength;
  return n * uAmp + pull;
}
vec3 liquidDisplace(vec3 d){
  return shapeBase(d) * (1.0 + liquidField(d));
}
`;

const liquidNormal = /* glsl */ `
vec3 objectNormal;
vec3 liquidPos;
{
  vec3 n0 = normalize(position);
  vec3 helper = abs(n0.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t = normalize(cross(n0, helper));
  vec3 b = normalize(cross(n0, t));
  const float eps = 0.008;
  vec3 p0 = liquidDisplace(n0);
  vec3 p1 = liquidDisplace(normalize(n0 + t * eps));
  vec3 p2 = liquidDisplace(normalize(n0 + b * eps));
  liquidPos = p0;
  objectNormal = normalize(cross(p1 - p0, p2 - p0));
}
#ifdef USE_TANGENT
  vec3 objectTangent = vec3(tangent.xyz);
#endif
`;

const liquidBegin = /* glsl */ `
vec3 transformed = liquidPos;
#ifdef USE_ALPHAHASH
  vPosition = vec3(position);
#endif
`;

/**
 * Patch a MeshPhysicalMaterial in place with the liquid displacement.
 * `uniforms` is shared by reference so the render loop can update it.
 * @param {import('three').MeshPhysicalMaterial} material
 * @param {Record<string, { value: unknown }>} uniforms
 */
export function applyLiquidShader(material, uniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${liquidHeader}`)
      .replace('#include <beginnormal_vertex>', liquidNormal)
      .replace('#include <begin_vertex>', liquidBegin);
  };
  material.customProgramCacheKey = () => 'liquid-form-v3';
}
