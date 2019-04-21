import random
from scipy.stats import norm, maxwell
from bottle import route, run, request, response
import json
from scipy.stats import maxwell
import numpy as np


m_e = 9.10938291E-31
q_e = 1.60217662E-19
h_bar = 6.62607015E-34
u = 1.66054E-27
k_b = 1.38064852E-23
TPF = 0.000004

e = {"g": 2, "q": -q_e, "m": m_e, "s": 0.5}
hydrogen = {'M': (1.00794 * u), 'valence': e}
lithium = {'M': (6.941 * u), 'valence': e}
sodium = {'M': (22.989769 * u), 'valence': e}
atomBook = {"hydrogen": hydrogen, 'lithium': lithium, 'sodium': sodium}

def get_scale_from_mu(mu):
    """
    use later for maxwell
    """
    sigma2 = ((3*np.pi - 8)*mu**2) / 8
    return np.sqrt(sigma2)

def get_loc_from_mu(mu):
    """
    for maxwell too
    """
    scale = get_scale_from_mu(mu)
    loc = mu - 2.0 * scale * np.sqrt(2.0 / np.pi)
    return loc

def get_y_velocity():
    y_velocity = norm.rvs(loc=0, scale=500)
    return y_velocity

def get_x_velocity(T, L, atom):
    '''
    this gets average velocity (not even in x, y-axis), so need to fix

    '''
    x_velocity_avg = ((3 * T * k_b)/(atom['M'])) ** (1/2)
    scale = get_scale_from_mu(x_velocity_avg)
    loc = get_loc_from_mu(x_velocity_avg)
    #print(scale, loc)
    x_velocity = maxwell.rvs(scale = scale, loc = loc)
    #print(x_velocity)
    return x_velocity


def getTime(T, L, atom, x_velocity): #correct
    time = L / x_velocity
    #print(time * x_velocity)
    return time


def intrinsicDipoleMomentum(particle):
    g, q, m, s = particle["g"], particle["q"], particle["m"], particle["s"]
    m_s = []
    negative_s = -s
    while s >= negative_s:
        m_s.append(s)
        s -= 1

    random_m_s = random.choice(m_s)
    momentum = -g * (q/(2*m))* random_m_s * h_bar * 70
    return momentum


def get_z_Force(particle, magnetic_gradient):
    momentum = intrinsicDipoleMomentum(particle)
    force = momentum * magnetic_gradient
    return force


def get_z_Acceleration(atom, magnetic_gradient):
    M = atom['M']
    particle = atom['valence']
    acceleration = get_z_Force(particle, magnetic_gradient)/M
    return acceleration


def get_z_Distance(T, L, atom, magnetic_gradient):
    acceleration = get_z_Acceleration(atom, magnetic_gradient)
    time = getTime(T, L, atom)
    distance = (1/2) * acceleration * time ** 2
    return distance

def position(T, L, atom, magnetic_gradient):
    x_velocity = get_x_velocity(T, L, atom)
    y_velocity = get_y_velocity()
    z_acceleration = get_z_Acceleration(atom, magnetic_gradient)
    endTime = getTime(T, L, atom, x_velocity)
    position = []
    times = [TPF * i for i in range(int(endTime//TPF) + 1)]
    times.append(endTime)
    print(len(times))
    for i in times:
        x_distance = round(x_velocity * i, 8)
        y_distance = round(y_velocity * i, 8)
        z_distance = round((1/2) * z_acceleration * i**2, 8)
        position.append([x_distance, y_distance, z_distance])
    return position

def many_particles(T, L, atom, magnetic_gradient, big_num):
    atom = atomBook[atom]
    particle_dict = {}
    for i in range(big_num):
        particle_dict[i] = position(T, L, atom, magnetic_gradient)
    return particle_dict


@route('/sternGerlachExperiment', method="POST")
def index():
    #print("start")
    body = request.body.read()
    jsonObj = json.loads(body)
    temperature = int(jsonObj['temperature'])
    numSim = int(jsonObj['numSim'])
    MFG = float(jsonObj['MFG'])
    Particle = jsonObj["Particle"]
    dim = float(jsonObj['dim'])
    response.set_header('Access-Control-Allow-Origin', '*')
    dataSent = many_particles(temperature, dim, Particle, MFG, numSim)
    print(dataSent)
    #print("end")
    return dataSent


run(host='localhost', port=8080)


